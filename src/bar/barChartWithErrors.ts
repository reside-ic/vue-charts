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

    updateRender() {
        (this as Bar).addPlugin(ErrorBarsPlugin);
        (this as Bar).renderChart(this.chartData, {
            scales: {
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: this.yLabel
                    },
                    ticks: {
                        suggestedMax: this.chartData.maxValuePlusError,
                        beginAtZero: true
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
