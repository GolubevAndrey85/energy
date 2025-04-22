document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('searchForm');
    const loading = document.getElementById('loading');
    const plansContainer = document.getElementById('plansContainer');

    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const postcode = document.getElementById('postcode').value;

        // Show loading state
        loading.classList.remove('d-none');
        plansContainer.innerHTML = '';

        try {
            const response = await fetch(`/api/plans?postcode=${postcode}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch plans');
            }

            if (!data || !data.data || !data.data.plans) {
                throw new Error('Invalid data format received from API');
            }

            displayPlans(data.data.plans);
        } catch (error) {
            plansContainer.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger" role="alert">
                        ${error.message}
                    </div>
                </div>
            `;
        } finally {
            loading.classList.add('d-none');
        }
    });

    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-AU', {
            style: 'currency',
            currency: 'AUD'
        }).format(amount);
    }

    function displayPlans(plans) {
        if (!plans || !Array.isArray(plans) || plans.length === 0) {
            plansContainer.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-info" role="alert">
                        No plans found for this postcode.
                    </div>
                </div>
            `;
            return;
        }

        const plansHTML = plans.map(plan => {
            // Check if required properties exist
            if (!plan.pcr || !plan.pcr.costs || !plan.pcr.costs.electricity || 
                !plan.planData || !plan.planData.contract || !plan.planData.contract[0]) {
                console.warn('Invalid plan data structure:', plan);
                return '';
            }

            const smallUsage = plan.pcr.costs.electricity.small;
            const mediumUsage = plan.pcr.costs.electricity.medium;
            const largeUsage = plan.pcr.costs.electricity.large;
            const tariffInfo = plan.planData.contract[0];
            
            // Check if tariff period exists
            const tariffPeriod = tariffInfo.tariffPeriod && tariffInfo.tariffPeriod[0];
            const supplyCharge = tariffPeriod ? tariffPeriod.dailySupplyCharge / 100 : 0;
            const blockRates = tariffPeriod ? tariffPeriod.blockRate : [];

            // Check if solar fit exists
            const solarFit = tariffInfo.solarFit || [];
            const paymentOptions = tariffInfo.paymentOption || [];

            return `
                <div class="col-md-6 col-lg-4 mb-4">
                    <div class="card plan-card h-100">
                        <div class="card-header bg-primary text-white">
                            <h5 class="card-title mb-0">${plan.planData.retailerName || 'Unknown Retailer'}</h5>
                        </div>
                        <div class="card-body">
                            <h6 class="card-subtitle mb-3">${plan.planData.planName || 'Unknown Plan'}</h6>
                            
                            <div class="usage-costs mb-4">
                                <h6 class="text-muted">Estimated Annual Costs:</h6>
                                ${smallUsage ? `
                                    <div class="small-usage mb-2">
                                        <strong>Small Usage:</strong> ${formatCurrency(smallUsage.yearly.allDiscounts)}
                                    </div>
                                ` : ''}
                                ${mediumUsage ? `
                                    <div class="medium-usage mb-2">
                                        <strong>Medium Usage:</strong> ${formatCurrency(mediumUsage.yearly.allDiscounts)}
                                    </div>
                                ` : ''}
                                ${largeUsage ? `
                                    <div class="large-usage">
                                        <strong>Large Usage:</strong> ${formatCurrency(largeUsage.yearly.allDiscounts)}
                                    </div>
                                ` : ''}
                            </div>

                            ${tariffPeriod ? `
                                <div class="tariff-details mb-4">
                                    <h6 class="text-muted">Tariff Details:</h6>
                                    <div class="supply-charge mb-2">
                                        <strong>Daily Supply Charge:</strong> ${formatCurrency(supplyCharge)}
                                    </div>
                                    ${blockRates && blockRates.length > 0 ? `
                                        <div class="block-rates">
                                            <strong>Usage Rates:</strong>
                                            <ul class="list-unstyled">
                                                ${blockRates.map(rate => `
                                                    <li>${rate.volume ? `First ${rate.volume}kWh: ` : ''}${formatCurrency(rate.unitPrice / 100)}/kWh</li>
                                                `).join('')}
                                            </ul>
                                        </div>
                                    ` : ''}
                                </div>
                            ` : ''}

                            ${paymentOptions && paymentOptions.length > 0 ? `
                                <div class="payment-options mb-4">
                                    <h6 class="text-muted">Payment Options:</h6>
                                    <div class="d-flex flex-wrap gap-2">
                                        ${paymentOptions.map(option => `
                                            <span class="badge bg-secondary">${getPaymentOptionName(option)}</span>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}

                            ${solarFit && solarFit.length > 0 ? `
                                <div class="solar-feed mb-4">
                                    <h6 class="text-muted">Solar Feed-in Tariffs:</h6>
                                    ${solarFit.map(fit => `
                                        <div class="mb-2">
                                            <strong>${fit.displayName || 'Feed-in Tariff'}:</strong> ${formatCurrency(fit.rate / 100)}/kWh
                                        </div>
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).filter(html => html !== '').join('');

        plansContainer.innerHTML = plansHTML || `
            <div class="col-12">
                <div class="alert alert-warning" role="alert">
                    No valid plans found in the response.
                </div>
            </div>
        `;
    }

    function getPaymentOptionName(code) {
        const options = {
            'P': 'Pay on Time',
            'DD': 'Direct Debit',
            'CC': 'Credit Card',
            'BP': 'BPAY'
        };
        return options[code] || code;
    }
}); 