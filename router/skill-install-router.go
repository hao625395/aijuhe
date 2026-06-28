package router

import (
	"embed"
	"io/fs"
	"mime"
	"net/http"
	"path"
	"strings"

	"github.com/QuantumNous/new-api/middleware"
	"github.com/gin-gonic/gin"
)

func SetSkillInstallRouter(router *gin.Engine, skillFS embed.FS) {
	subFS, err := fs.Sub(skillFS, "install/skill/image-gen")
	if err != nil {
		panic(err)
	}
	handler := serveSkillInstallFile(subFS)
	router.GET("/install/skill/image-gen", handler)
	router.HEAD("/install/skill/image-gen", handler)
	router.GET("/install/skill/image-gen/*filepath", handler)
	router.HEAD("/install/skill/image-gen/*filepath", handler)
	router.GET("/skill/image-gen", handler)
	router.HEAD("/skill/image-gen", handler)
	router.GET("/skill/image-gen/*filepath", handler)
	router.HEAD("/skill/image-gen/*filepath", handler)
}

func serveSkillInstallFile(skillFS fs.FS) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Set(middleware.RouteTagKey, "skill_install")
		filePath := strings.TrimPrefix(c.Param("filepath"), "/")
		if filePath == "" {
			filePath = "INSTALL.md"
		}
		cleanPath := path.Clean(filePath)
		if cleanPath == "." || strings.HasPrefix(cleanPath, "../") || cleanPath == ".." {
			c.String(http.StatusBadRequest, "bad path")
			return
		}
		data, err := fs.ReadFile(skillFS, cleanPath)
		if err != nil {
			c.String(http.StatusNotFound, "not found")
			return
		}
		contentType := mime.TypeByExtension(path.Ext(cleanPath))
		if contentType == "" {
			contentType = "text/plain; charset=utf-8"
		}
		c.Header("Cache-Control", "public, max-age=300")
		c.Data(http.StatusOK, contentType, data)
	}
}
