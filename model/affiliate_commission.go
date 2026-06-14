package model

import (
	"math"

	"github.com/QuantumNous/new-api/common"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

const DefaultAffiliateCommissionRate = 0.05

type AffiliateCommission struct {
	Id              int     `json:"id"`
	InviterId       int     `json:"inviter_id" gorm:"index"`
	InviteeId       int     `json:"invitee_id" gorm:"index"`
	TopUpId         int     `json:"topup_id" gorm:"uniqueIndex"`
	TradeNo         string  `json:"trade_no" gorm:"type:varchar(255);uniqueIndex"`
	TopUpAmount     float64 `json:"topup_amount"`
	CommissionRate  float64 `json:"commission_rate"`
	CommissionQuota int     `json:"commission_quota"`
	CreateTime      int64   `json:"create_time" gorm:"index"`
}

type AffiliateInviteeSummary struct {
	Id              int    `json:"id"`
	Username        string `json:"username"`
	DisplayName     string `json:"display_name"`
	Email           string `json:"email"`
	AffHistoryQuota int    `json:"aff_history_quota"`
	CreatedAt       int64  `json:"created_at"`
}

type AffiliateSummary struct {
	Rate         float64                   `json:"rate"`
	PendingQuota int                       `json:"pending_quota"`
	HistoryQuota int                       `json:"history_quota"`
	InviteCount  int                       `json:"invite_count"`
	TodayQuota   int                       `json:"today_quota"`
	MonthQuota   int                       `json:"month_quota"`
	Records      []AffiliateCommission     `json:"records"`
	InvitedUsers []AffiliateInviteeSummary `json:"invited_users"`
}

func EffectiveAffiliateCommissionRate(user User) float64 {
	if user.AffCommissionRate > 0 {
		return user.AffCommissionRate
	}
	return DefaultAffiliateCommissionRate
}

func CreateAffiliateCommissionForTopUp(tx *gorm.DB, topUp *TopUp) error {
	if topUp == nil || topUp.UserId <= 0 || topUp.Id <= 0 {
		return nil
	}
	db := tx
	if db == nil {
		db = DB
	}

	invitee := User{}
	if err := db.Select("id", "inviter_id").First(&invitee, topUp.UserId).Error; err != nil {
		return err
	}
	if invitee.InviterId <= 0 || invitee.InviterId == invitee.Id {
		return nil
	}

	inviter := User{}
	if err := db.Set("gorm:query_option", "FOR UPDATE").First(&inviter, invitee.InviterId).Error; err != nil {
		return err
	}

	rate := EffectiveAffiliateCommissionRate(inviter)
	if rate <= 0 {
		return nil
	}

	commissionQuota := int(math.Round(topUp.Money * common.QuotaPerUnit * rate))
	if commissionQuota <= 0 {
		return nil
	}

	record := AffiliateCommission{
		InviterId:       inviter.Id,
		InviteeId:       invitee.Id,
		TopUpId:         topUp.Id,
		TradeNo:         topUp.TradeNo,
		TopUpAmount:     topUp.Money,
		CommissionRate:  rate,
		CommissionQuota: commissionQuota,
		CreateTime:      common.GetTimestamp(),
	}

	result := db.Clauses(clause.OnConflict{DoNothing: true}).Create(&record)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return nil
	}

	return db.Model(&User{}).
		Where("id = ?", inviter.Id).
		Updates(map[string]interface{}{
			"aff_quota":   gorm.Expr("aff_quota + ?", commissionQuota),
			"aff_history": gorm.Expr("aff_history + ?", commissionQuota),
		}).Error
}

func GetAffiliateSummary(userId int, limit int) (AffiliateSummary, error) {
	if limit <= 0 || limit > 100 {
		limit = 20
	}

	user := User{}
	if err := DB.First(&user, userId).Error; err != nil {
		return AffiliateSummary{}, err
	}

	now := common.GetTimestamp()
	todayStart := now - now%86400
	monthStart := now - 30*86400

	var todayQuota int64
	if err := DB.Model(&AffiliateCommission{}).
		Where("inviter_id = ? AND create_time >= ?", userId, todayStart).
		Select("COALESCE(SUM(commission_quota), 0)").
		Scan(&todayQuota).Error; err != nil {
		return AffiliateSummary{}, err
	}

	var monthQuota int64
	if err := DB.Model(&AffiliateCommission{}).
		Where("inviter_id = ? AND create_time >= ?", userId, monthStart).
		Select("COALESCE(SUM(commission_quota), 0)").
		Scan(&monthQuota).Error; err != nil {
		return AffiliateSummary{}, err
	}

	records := make([]AffiliateCommission, 0, limit)
	if err := DB.Where("inviter_id = ?", userId).
		Order("id desc").
		Limit(limit).
		Find(&records).Error; err != nil {
		return AffiliateSummary{}, err
	}

	invitedUsers := make([]AffiliateInviteeSummary, 0, limit)
	if err := DB.Table("users").
		Select("users.id, users.username, users.display_name, users.email, users.aff_history as aff_history_quota, users.created_at").
		Where("users.inviter_id = ?", userId).
		Order("users.id desc").
		Limit(limit).
		Scan(&invitedUsers).Error; err != nil {
		return AffiliateSummary{}, err
	}

	return AffiliateSummary{
		Rate:         EffectiveAffiliateCommissionRate(user),
		PendingQuota: user.AffQuota,
		HistoryQuota: user.AffHistoryQuota,
		InviteCount:  user.AffCount,
		TodayQuota:   int(todayQuota),
		MonthQuota:   int(monthQuota),
		Records:      records,
		InvitedUsers: invitedUsers,
	}, nil
}
