package controller

import (
	"net/http"

	"github.com/QuantumNous/new-api/setting"
	"github.com/QuantumNous/new-api/setting/ratio_setting"

	"github.com/gin-gonic/gin"
)

func GetGroups(c *gin.Context) {
	groupNames := make([]string, 0)
	for groupName := range ratio_setting.GetGroupRatioCopy() {
		groupNames = append(groupNames, groupName)
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    groupNames,
	})
}

func GetUserGroups(c *gin.Context) {
	usableGroups := make(map[string]map[string]interface{})
	for groupName, _ := range ratio_setting.GetGroupRatioCopy() {
		usableGroups[groupName] = map[string]interface{}{
			"ratio": ratio_setting.GetGroupRatio(groupName),
			"desc":  setting.GetUsableGroupDescription(groupName),
		}
	}
	usableGroups["auto"] = map[string]interface{}{
		"ratio": "自动",
		"desc":  setting.GetUsableGroupDescription("auto"),
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    usableGroups,
	})
}
