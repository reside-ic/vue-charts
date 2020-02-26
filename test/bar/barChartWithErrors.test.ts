import Vue from "vue";
import {shallowMount} from "@vue/test-utils";
import BarChartWithErrors from "../../src/bar/BarChartWithErrors";

describe("chartjsBar component", () => {

    const propsData = {
        xLabel: "X Axis",
        yLabel: "Y Axis",
        chartData: {
            labels: ["group1", "group2"],
            datasets:[
                {
                    label: "dataset1",
                    backgroundColor: "#111111",
                    data: [1,2],
                    errorBars: {
                        "group1": {plus: 1.1, minus: 0.9},
                        "group2": {plus: 2.1, minus: 1.9}
                    }
                }
            ]
        }
    };

    const getWrapper = () => {
        return shallowMount(BarChartWithErrors, {propsData});
    };

    it("renders as expected", () => {
        const wrapper = getWrapper();
        expect(wrapper.findAll("canvas").length).toEqual(1);
    });

    it("updates render when props chartData changes", async () => {
        const wrapper = getWrapper();
        const mockUpdate = jest.fn();
        const vm = (wrapper as any).vm;
        vm.updateRender = mockUpdate;

        const newChartData = {
            ...propsData.chartData,
            labels: ["group1"]
        };
        wrapper.setProps({
            ...propsData,
            chartData: newChartData
        });

        await Vue.nextTick();

        expect(mockUpdate.mock.calls.length).toBe(1);
    });

    it("updateRender calls renderChart with expected data and metadata", async () => {
        const wrapper = getWrapper();
        const mockRenderChart = jest.fn();
        const vm = (wrapper as any).vm;
        vm.renderChart = mockRenderChart;

        const newChartData = {
            ...propsData.chartData,
            labels: ["group1"]
        };
        wrapper.setProps({
            ...propsData,
            chartData: newChartData
        });

        await Vue.nextTick();

        expect(mockRenderChart.mock.calls.length).toBe(1);
        expect(mockRenderChart.mock.calls[0][0]).toBe(newChartData);
        expect(mockRenderChart.mock.calls[0][1]).toStrictEqual({
            scales: {
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: "Y Axis"
                    },
                    ticks: {
                        beginAtZero: true
                    }
                }],
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: "X Axis"
                    }
                }]
            },
            legend: {
                position: "right",
            },
            responsive:true,
            maintainAspectRatio: false,
            plugins: {
                chartJsPluginErrorBars: {
                    color: '#000',
                    width: '2px',
                    lineWidth: '2px',
                    absoluteValues: true
                }
            }
        });

    });
});