import Vue from "vue";
import {shallowMount} from "@vue/test-utils";
import BarChartWithErrors from "../../src/bar/BarChartWithErrors";

describe("chartjsBar component", () => {

    const formatFunc = (value: string | number ) => "Value " + value.toString();
    const propsData = {
        xLabel: "X Axis",
        yLabel: "Y Axis",
        yFormat: formatFunc,
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
            labels: ["group1"],
            maxValuePlusError: 0.2
        };
        wrapper.setProps({
            ...propsData,
            chartData: newChartData
        });

        await Vue.nextTick();

        expect(mockRenderChart.mock.calls.length).toBe(1);
        expect(mockRenderChart.mock.calls[0][0]).toBe(newChartData);

        const renderedConfig = mockRenderChart.mock.calls[0][1];
        expect(renderedConfig.scales).toStrictEqual({
            yAxes: [{
                scaleLabel: {
                    display: true,
                    labelString: "Y Axis"
                },
                ticks: {
                    beginAtZero: true,
                    suggestedMax: 0.2,
                    callback: formatFunc
                }
            }],
                xAxes: [{
                scaleLabel: {
                    display: true,
                    labelString: "X Axis"
                }
            }]
        });
        expect(renderedConfig.legend).toStrictEqual({
            position: "right",
        });

        //Test that the callback to construct the label based on the format func behaves as expected
        const tooltipLabelCallback = renderedConfig.tooltips.callbacks.label;
        const renderedLabel = tooltipLabelCallback({datasetIndex: 0, yLabel: 2}, newChartData);
        expect(renderedLabel).toBe("dataset1: Value 2");

        expect(renderedConfig.responsive).toBe(true);
        expect(renderedConfig.maintainAspectRatio).toBe(false);
        expect(renderedConfig.plugins).toStrictEqual({
            chartJsPluginErrorBars: {
                color: '#000',
                width: '2px',
                lineWidth: '2px',
                absoluteValues: true
            }
        });

    });

    it("tooltip label callback deals with incomplete parameters", async () => {
        const wrapper = getWrapper();
        const mockRenderChart = jest.fn();
        const vm = (wrapper as any).vm;
        vm.renderChart = mockRenderChart;

        const newChartData = {
            ...propsData.chartData,
        };
        wrapper.setProps({
            ...propsData,
            chartData: newChartData
        });

        await Vue.nextTick();

        const renderedConfig = mockRenderChart.mock.calls[0][1];
        const tooltipLabelCallback = renderedConfig.tooltips.callbacks.label;

        //tooltipItem.datasetIndex is undefined
        let renderedLabel = tooltipLabelCallback({yLabel: 2}, newChartData);
        expect(renderedLabel).toBe("Value 2");

        //data.datasets is undefined
        renderedLabel = tooltipLabelCallback({datasetIndex: 0, yLabel: 2}, {});
        expect(renderedLabel).toBe("Value 2");

        //tooltip.yLabel is undefined - returns dataseries label
        renderedLabel = tooltipLabelCallback({datasetIndex: 0}, newChartData);
        expect(renderedLabel).toBe("dataset1: ");
    });
});
