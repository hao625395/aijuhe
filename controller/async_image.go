package controller

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"sync"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/constant"
	"github.com/QuantumNous/new-api/types"

	"github.com/gin-gonic/gin"
)

const (
	asyncImageTaskTTL     = 2 * time.Hour
	asyncImageMaxTaskSize = 1000
)

type asyncImageTaskStatus string

const (
	asyncImageStatusQueued    asyncImageTaskStatus = "queued"
	asyncImageStatusRunning   asyncImageTaskStatus = "running"
	asyncImageStatusSucceeded asyncImageTaskStatus = "succeeded"
	asyncImageStatusFailed    asyncImageTaskStatus = "failed"
)

type asyncImageTask struct {
	ID          string
	TokenID     int
	UserID      int
	Status      asyncImageTaskStatus
	StatusCode  int
	Response    []byte
	Error       string
	CreatedAt   time.Time
	UpdatedAt   time.Time
	CompletedAt *time.Time
}

var asyncImageTasks = struct {
	sync.RWMutex
	items map[string]*asyncImageTask
}{
	items: make(map[string]*asyncImageTask),
}

func SubmitAsyncImageGeneration(c *gin.Context) {
	body, err := getAsyncImageRequestBody(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": types.OpenAIError{
				Message: err.Error(),
				Type:    "invalid_request_error",
				Code:    types.ErrorCodeInvalidRequest,
			},
		})
		return
	}

	body, err = normalizeAsyncImageRequestBody(body)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": types.OpenAIError{
				Message: err.Error(),
				Type:    "invalid_request_error",
				Code:    types.ErrorCodeInvalidRequest,
			},
		})
		return
	}

	task := &asyncImageTask{
		ID:        common.GetRandomString(32),
		TokenID:   c.GetInt("token_id"),
		UserID:    c.GetInt("id"),
		Status:    asyncImageStatusQueued,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	storeAsyncImageTask(task)

	headers := cloneAsyncImageHeaders(c.Request.Header)
	keys := cloneGinKeys(c)

	go runAsyncImageGeneration(task.ID, body, headers, keys)

	c.JSON(http.StatusAccepted, gin.H{
		"id":       task.ID,
		"object":   "image_generation_task",
		"status":   task.Status,
		"poll_url": "/v1/images/generations/async/" + task.ID,
	})
}

func GetAsyncImageGenerationTask(c *gin.Context) {
	cleanupAsyncImageTasks()

	taskID := c.Param("id")
	task := getAsyncImageTask(taskID)
	if task == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": types.OpenAIError{
				Message: "image generation task not found",
				Type:    "invalid_request_error",
				Code:    types.ErrorCodeInvalidRequest,
			},
		})
		return
	}

	if task.TokenID != 0 && task.TokenID != c.GetInt("token_id") {
		c.JSON(http.StatusForbidden, gin.H{
			"error": types.OpenAIError{
				Message: "image generation task does not belong to this API key",
				Type:    "invalid_request_error",
				Code:    types.ErrorCodeAccessDenied,
			},
		})
		return
	}

	resp := gin.H{
		"id":          task.ID,
		"object":      "image_generation_task",
		"status":      task.Status,
		"created_at":  task.CreatedAt.Unix(),
		"updated_at":  task.UpdatedAt.Unix(),
		"status_code": task.StatusCode,
	}
	if task.CompletedAt != nil {
		resp["completed_at"] = task.CompletedAt.Unix()
	}
	if task.Status == asyncImageStatusSucceeded && len(task.Response) > 0 {
		var raw any
		if err := common.Unmarshal(task.Response, &raw); err == nil {
			resp["response"] = raw
		} else {
			resp["response_text"] = string(task.Response)
		}
	}
	if task.Status == asyncImageStatusFailed {
		resp["error"] = gin.H{
			"message": task.Error,
			"type":    "upstream_error",
			"code":    "async_image_generation_failed",
		}
	}
	c.JSON(http.StatusOK, resp)
}

func getAsyncImageRequestBody(c *gin.Context) ([]byte, error) {
	storage, err := common.GetBodyStorage(c)
	if err != nil {
		return nil, err
	}
	body, err := storage.Bytes()
	if err != nil {
		return nil, err
	}
	if len(body) == 0 {
		return nil, fmt.Errorf("request body is empty")
	}
	return body, nil
}

func normalizeAsyncImageRequestBody(body []byte) ([]byte, error) {
	var payload map[string]any
	if err := common.Unmarshal(body, &payload); err != nil {
		return nil, err
	}
	payload["stream"] = false
	payload["response_format"] = "url"
	return common.Marshal(payload)
}

func storeAsyncImageTask(task *asyncImageTask) {
	asyncImageTasks.Lock()
	defer asyncImageTasks.Unlock()
	if len(asyncImageTasks.items) >= asyncImageMaxTaskSize {
		removeOldestAsyncImageTaskLocked()
	}
	asyncImageTasks.items[task.ID] = task
}

func getAsyncImageTask(id string) *asyncImageTask {
	asyncImageTasks.RLock()
	defer asyncImageTasks.RUnlock()
	task := asyncImageTasks.items[id]
	if task == nil {
		return nil
	}
	copied := *task
	if task.Response != nil {
		copied.Response = append([]byte(nil), task.Response...)
	}
	return &copied
}

func updateAsyncImageTask(id string, apply func(task *asyncImageTask)) {
	asyncImageTasks.Lock()
	defer asyncImageTasks.Unlock()
	task := asyncImageTasks.items[id]
	if task == nil {
		return
	}
	apply(task)
	task.UpdatedAt = time.Now()
}

func cleanupAsyncImageTasks() {
	asyncImageTasks.Lock()
	defer asyncImageTasks.Unlock()
	now := time.Now()
	for id, task := range asyncImageTasks.items {
		if now.Sub(task.UpdatedAt) > asyncImageTaskTTL {
			delete(asyncImageTasks.items, id)
		}
	}
}

func removeOldestAsyncImageTaskLocked() {
	var oldestID string
	var oldestTime time.Time
	for id, task := range asyncImageTasks.items {
		if oldestID == "" || task.UpdatedAt.Before(oldestTime) {
			oldestID = id
			oldestTime = task.UpdatedAt
		}
	}
	if oldestID != "" {
		delete(asyncImageTasks.items, oldestID)
	}
}

func cloneAsyncImageHeaders(src http.Header) http.Header {
	dst := src.Clone()
	dst.Set("Content-Type", "application/json")
	dst.Set("Accept", "application/json")
	return dst
}

func cloneGinKeys(c *gin.Context) map[string]any {
	keys := make(map[string]any, len(c.Keys))
	for k, v := range c.Keys {
		keys[k] = v
	}
	keys[string(constant.ContextKeyRequestStartTime)] = time.Now()
	return keys
}

func runAsyncImageGeneration(taskID string, body []byte, headers http.Header, keys map[string]any) {
	updateAsyncImageTask(taskID, func(task *asyncImageTask) {
		task.Status = asyncImageStatusRunning
	})

	recorder := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(recorder)
	req, err := http.NewRequestWithContext(context.Background(), http.MethodPost, "/v1/images/generations", bytes.NewReader(body))
	if err != nil {
		markAsyncImageTaskFailed(taskID, http.StatusInternalServerError, err.Error())
		return
	}
	req.Header = headers.Clone()
	ctx.Request = req
	ctx.Keys = keys

	storage, err := common.CreateBodyStorage(body)
	if err != nil {
		markAsyncImageTaskFailed(taskID, http.StatusInternalServerError, err.Error())
		return
	}
	ctx.Set(common.KeyBodyStorage, storage)
	ctx.Request.Body = io.NopCloser(storage)
	defer common.CleanupBodyStorage(ctx)

	Relay(ctx, types.RelayFormatOpenAIImage)

	statusCode := recorder.Code
	if statusCode == 0 {
		statusCode = http.StatusOK
	}
	responseBody := recorder.Body.Bytes()
	now := time.Now()
	updateAsyncImageTask(taskID, func(task *asyncImageTask) {
		task.StatusCode = statusCode
		task.CompletedAt = &now
		if statusCode >= http.StatusBadRequest {
			task.Status = asyncImageStatusFailed
			task.Error = string(responseBody)
			if task.Error == "" {
				task.Error = http.StatusText(statusCode)
			}
			return
		}
		task.Status = asyncImageStatusSucceeded
		task.Response = append([]byte(nil), responseBody...)
	})
}

func markAsyncImageTaskFailed(taskID string, statusCode int, message string) {
	now := time.Now()
	updateAsyncImageTask(taskID, func(task *asyncImageTask) {
		task.Status = asyncImageStatusFailed
		task.StatusCode = statusCode
		task.Error = message
		task.CompletedAt = &now
	})
}
