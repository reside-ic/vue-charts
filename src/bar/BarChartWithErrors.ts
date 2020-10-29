import {Bar} from 'vue-chartjs'
import ErrorBarsPlugin from 'chartjs-plugin-error-bars'
import Component, {mixins} from "vue-class-component";
import {Prop, Watch} from "vue-property-decorator";
import {BarChartData} from "./utils";

@Component
export default class BarChartWithErrors extends mixins(Bar) {

    @Prop()
    chartData!: BarChartData;

    @Prop()
    xLabel!: string;

    @Prop()
    yLabel!: string;

    @Prop()
    yFormat!: (value: number | string) => string;

    updateRender() {
        (this as Bar).addPlugin(ErrorBarsPlugin);

        const formatCallback = this.yFormat || ((value: number | string) => value);
        (this as Bar).renderChart(this.chartData, {
            scales: {
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: this.yLabel
                    },
                    ticks: {
                        suggestedMax: this.chartData.maxValuePlusError,
                        beginAtZero: true,
                        callback: formatCallback
                    }
                }],
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: this.xLabel
                    }
                }]
            },
            legend: {
                position: "right",
            },
            tooltips: {
                callbacks: {
                    label: function(tooltipItem, data) {
                        let label = ((typeof tooltipItem.datasetIndex !== "undefined") && data.datasets && data.datasets[tooltipItem.datasetIndex].label)
                                        || '';
                        if (label) {
                            label += ': ';
                        }

                        if (tooltipItem.yLabel) {
                            label += formatCallback(tooltipItem.yLabel);
                        }
                        return label;
                    }
                }
            },
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                chartJsPluginErrorBars: {
                    color: '#000',
                    width: '2px',
                    lineWidth: '2px',
                    absoluteValues: true
                }
            }
        })
    }

    mounted() {
        this.updateRender();
    }

    @Watch("chartData")
    chartDataChanged() {
        this.updateRender();
    }
};
