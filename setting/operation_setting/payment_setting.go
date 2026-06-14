package operation_setting

import "github.com/QuantumNous/new-api/setting/config"

var defaultTopupAmountOptions = []int{20, 50, 100, 500, 1000, 2000}
var legacyTopupAmountOptions = []int{10, 20, 50, 100, 200, 500}
var defaultTopupAmountBonus = map[int]int{
	100:  3,
	500:  20,
	1000: 50,
	2000: 110,
}

type PaymentSetting struct {
	AmountOptions          []int           `json:"amount_options"`
	AmountDiscount         map[int]float64 `json:"amount_discount"`
	AmountBonus            map[int]int     `json:"amount_bonus"`
	ComplianceConfirmed    bool            `json:"compliance_confirmed"`
	ComplianceTermsVersion string          `json:"compliance_terms_version"`
	ComplianceConfirmedAt  int64           `json:"compliance_confirmed_at"`
	ComplianceConfirmedBy  int             `json:"compliance_confirmed_by"`
	ComplianceConfirmedIP  string          `json:"compliance_confirmed_ip"`
}

const CurrentComplianceTermsVersion = "v1"

var paymentSetting = PaymentSetting{
	AmountOptions:  defaultTopupAmountOptions,
	AmountDiscount: map[int]float64{},
	AmountBonus:    defaultTopupAmountBonus,
}

func init() {
	config.GlobalConfig.Register("payment_setting", &paymentSetting)
}

func GetPaymentSetting() *PaymentSetting {
	return &paymentSetting
}

func cloneIntSlice(values []int) []int {
	if len(values) == 0 {
		return []int{}
	}
	cloned := make([]int, len(values))
	copy(cloned, values)
	return cloned
}

func sameIntSlice(a []int, b []int) bool {
	if len(a) != len(b) {
		return false
	}
	for i := range a {
		if a[i] != b[i] {
			return false
		}
	}
	return true
}

func GetTopupAmountOptions() []int {
	if len(paymentSetting.AmountOptions) == 0 ||
		sameIntSlice(paymentSetting.AmountOptions, legacyTopupAmountOptions) {
		return cloneIntSlice(defaultTopupAmountOptions)
	}
	return cloneIntSlice(paymentSetting.AmountOptions)
}

func GetTopupBonusMap() map[int]int {
	bonusMap := make(map[int]int, len(defaultTopupAmountBonus)+len(paymentSetting.AmountBonus))
	for amount, bonus := range defaultTopupAmountBonus {
		bonusMap[amount] = bonus
	}
	for amount, bonus := range paymentSetting.AmountBonus {
		if bonus > 0 {
			bonusMap[amount] = bonus
		}
	}
	return bonusMap
}

func GetTopupBonusAmount(amount int64) int64 {
	if amount <= 0 {
		return 0
	}
	bonus := GetTopupBonusMap()[int(amount)]
	if bonus <= 0 {
		return 0
	}
	return int64(bonus)
}

func GetTopupCreditAmount(amount int64) int64 {
	return amount + GetTopupBonusAmount(amount)
}

func IsPaymentComplianceConfirmed() bool {
	return paymentSetting.ComplianceConfirmed &&
		paymentSetting.ComplianceTermsVersion == CurrentComplianceTermsVersion
}
