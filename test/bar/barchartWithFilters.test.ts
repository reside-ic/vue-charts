import Vue from 'vue';
import {shallowMount, Wrapper} from "@vue/test-utils";

import {data, filters} from "./utils.test";
import BarChartWithFilters from "../../src/bar/BarChartWithFilters.vue";
import BarChartWithErrors from "../../src/bar/BarChartWithErrors";
import {BarchartIndicator} from "../../src/bar/types";

const formatFunction = (value: string | number, indicator: BarchartIndicator) => {
    return `Value: ${value}, Indicator: ${indicator.indicator}`;
};

const propsData = {
    chartData: data,
    filterConfig: {filters},
    indicators: [
        {
            indicator: "art_cov",
            value_column: "mean",
            indicator_column: "indicator",
            indicator_value: "2",
            name: "ART coverage",
            error_low_column: "low",
            error_high_column: "high"
        },
        {
            indicator: "prevalence",
            value_column: "mean",
            indicator_column: "indicator",
            indicator_value: "3",
            name: "Prevalence",
            error_low_column: "low",
            error_high_column: "high"
        }
    ],
    selections: {
        indicatorId: "art_cov",
        xAxisId: "region",
        disaggregateById: "age",
        selectedFilterOptions: {
            region: [{id: "1", label: "Northern"}],
            age: [{id: "0:4", label: "0-4"}],
            sex: [{id: "female", label: "female"}]
        }
    },
    formatFunction,
    xAxisConfig: {fixed: false, hideFilter: false},
    disaggregateByConfig: { fixed: false, hideFilter: false }
};

const uninitializedSelections = {
    indicatorId: "",
    xAxisId: "",
    disaggregateById: "",
    selectedFilterOptions: {}
};

const getWrapper = () => {
    return shallowMount(BarChartWithFilters, {propsData});
};

const confirmFormGroup = (wrapper: Wrapper<BarChartWithFilters>, elementId: string, label: string) => {
    const fg = wrapper.find(elementId);
    expect(fg.find("label").text()).toBe(label);
    expect(fg.findAll("tree-select-stub").length).toBe(1);
};

describe("Barchart component", () => {
    it("renders as expected", () => {
        const wrapper = getWrapper();

        expect(wrapper.find("h3").text()).toBe("Filters");

        confirmFormGroup(wrapper, "#indicator-fg", "Indicator");
        confirmFormGroup(wrapper, "#x-axis-fg", "X Axis");
        confirmFormGroup(wrapper, "#disagg-fg", "Disaggregate by");

        const region = wrapper.find("#filter-region filter-select-stub");
        expect(region.attributes("label")).toBe("Region");
        expect(region.attributes("isxaxis")).toBe("true");
        expect(region.attributes("isdisaggregateby")).toBeUndefined();

        const age = wrapper.find("#filter-age filter-select-stub");
        expect(age.attributes("label")).toBe("Age group");
        expect(age.attributes("isxaxis")).toBeUndefined();
        expect(age.attributes("isdisaggregateby")).toBe("true");

        const chart = wrapper.find("#chart bar-chart-with-errors-stub");
        expect(chart.attributes("xlabel")).toBe("Region");
        expect(chart.attributes("ylabel")).toBe("ART coverage");

        const xAxis = wrapper.find("#x-axis-fg");
        expect(xAxis.find("label").text()).toBe("X Axis");
        expect(xAxis.find("tree-select-stub").attributes("value")).toBe("region");

        const disagg = wrapper.find("#disagg-fg");
        expect(disagg.find("label").text()).toBe("Disaggregate by");
        expect(disagg.find("tree-select-stub").attributes("value")).toBe("age");
    });

    it("computes x axis label", () => {
        const wrapper = getWrapper();
        const vm = (wrapper as any).vm;

        const result = vm.xAxisLabel;
        expect(result).toBe("Region");

    });

    it("computes x axis labels", () => {
        const wrapper = getWrapper();
        const vm = (wrapper as any).vm;

        const result = vm.xAxisLabels;
        expect(result).toStrictEqual(["Northern"]);
    });

    it("computes x axis values", () => {
        const wrapper = getWrapper();
        const vm = (wrapper as any).vm;

        const result = vm.xAxisValues;
        expect(result).toStrictEqual(["1"]);
    });

    it("computes bar label lookup", () => {
        const wrapper = getWrapper();
        const vm = (wrapper as any).vm;

        const result = vm.barLabelLookup;
        expect(result).toStrictEqual({"0:4": "0-4"});
    });

    it("computes x axis label lookup", () => {
        const wrapper = getWrapper();
        const vm = (wrapper as any).vm;

        const result = vm.xAxisLabelLookup;
        expect(result).toStrictEqual({"1": "Northern"});
    });

    it("computes filters as options", () => {
        const wrapper = getWrapper();
        const vm = (wrapper as any).vm;

        const result = vm.filtersAsOptions
        expect(result).toStrictEqual([
            {id: "region", label: "Region"},
            {id: "age", label: "Age group"},
            {id: "sex", label: "Sex"}
        ]);
    });

    it("computes indicator", () => {
        const wrapper = getWrapper();
        const vm = (wrapper as any).vm;

        const result = vm.indicator;
        expect(result).toBe(propsData.indicators[0]);
    });

    it("computed processedData", () => {
        const wrapper = getWrapper();
        const vm = (wrapper as any).vm;

        const result = vm.processedOutputData;
        expect(result).toStrictEqual({
            labels: ["Northern"],
            datasets: [
                {
                    label: "0-4",
                    backgroundColor: "#e41a1c",
                    data: [0.40],
                    errorBars: {"Northern": {plus: 0.43, minus: 0.38}}
                }
            ],
            maxValuePlusError: 0.43
        });
    });

    it("computes formatValueFunction and renders on BarChartWithErrors", () => {
        const wrapper = getWrapper();
        const vm = (wrapper as any).vm;

        const formatValueFunction = vm.formatValueFunction;
        expect(formatValueFunction(99)).toBe("Value: 99, Indicator: art_cov");

        expect(wrapper.find(BarChartWithErrors).props().yFormat).toBe(formatValueFunction);
    });

    it("computes initialised", () => {
        let wrapper = getWrapper();
        let vm = (wrapper as any).vm;
        expect(vm.initialised).toBe(true);

        const props = {
            ...propsData,
            selections: uninitializedSelections
        };
        wrapper = shallowMount(BarChartWithFilters, {propsData: props});
        vm = (wrapper as any).vm;
        expect(vm.initialised).toBe(false);
    });

    it("does not render controls when not initialised", () => {
        const props = {
            ...propsData,
            selections: uninitializedSelections
        };
        const wrapper = shallowMount(BarChartWithFilters, {propsData: props});

        expect(wrapper.findAll(".form-group").length).toBe(0);
        expect(wrapper.findAll("#chart").length).toBe(0);
    });

    it("initialises selections on create", () => {
        const props = {
            ...propsData,
            selections: uninitializedSelections
        };
        const wrapper = shallowMount(BarChartWithFilters, {propsData: props});

        Vue.nextTick();
        expect(wrapper.emitted()["update"].length).toBe(4);

        expect(wrapper.emitted()["update"][0][0]).toStrictEqual({indicatorId: "art_cov"});
        expect(wrapper.emitted()["update"][1][0]).toStrictEqual({xAxisId: "region"});
        expect(wrapper.emitted()["update"][2][0]).toStrictEqual({disaggregateById: "age"});
        expect(wrapper.emitted()["update"][3][0]).toStrictEqual({
            selectedFilterOptions: {
                region: [{id: "1", label: "Northern"}],
                age: [{id: "0:4", label: "0-4"}],
                sex: [{id: "female", label: "female"}]
            }
        });
    });

    it("normalizeIndicators returns expected result", () => {
        const wrapper = getWrapper();
        const vm = (wrapper as any).vm;
        const result = vm.normalizeIndicators(propsData.indicators[0]);
        expect(result).toStrictEqual({id: "art_cov", label: "ART coverage"});
    });

    it("setting indicatorId emits changed-selections event with new data", () => {
        const wrapper = getWrapper();
        const vm = (wrapper as any).vm;
        vm.indicatorId = "newIndicatorId";

        expect(wrapper.emitted()["update"].length).toBe(1);
        const expected = {indicatorId: "newIndicatorId"};
        expect(wrapper.emitted()["update"][0][0]).toStrictEqual(expected);
    });

    it("csetting xAxisId emits update event with new data", () => {
        const wrapper = getWrapper();
        const vm = (wrapper as any).vm;
        vm.xAxisId = "newXAxisId";

        expect(wrapper.emitted()["update"].length).toBe(1);
        const expected = {xAxisId: "newXAxisId"};
        expect(wrapper.emitted()["update"][0][0]).toStrictEqual(expected);
    });

    it("setting disaggregateById emits update event with new data", () => {
        const wrapper = getWrapper();
        const vm = (wrapper as any).vm;
        vm.disaggregateById = "newDisaggById";

        expect(wrapper.emitted()["update"].length).toBe(1);
        const expected = {disaggregateById: "newDisaggById"};
        expect(wrapper.emitted()["update"][0][0]).toStrictEqual(expected);
    });

    it("changeFilter emits update event with new data", () => {
        const wrapper = getWrapper();
        const vm = (wrapper as any).vm;
        vm.changeFilter("age", [{id: "newAgeId", label: "newAgeLabel"}]);

        expect(wrapper.emitted()["update"].length).toBe(1);

        const expectedSelectedFilterOptions = {
            ...propsData.selections.selectedFilterOptions,
            age: [{id: "newAgeId", label: "newAgeLabel"}]
        };

        const expected = {...propsData.selections, selectedFilterOptions: expectedSelectedFilterOptions};
        expect(wrapper.emitted()["update"][0][0]).toStrictEqual(expected);
    });

    it("hides x axis controls when x axis should be fixed", () => {
        const wrapper = shallowMount(BarChartWithFilters, {
            propsData: {
                ...propsData,
                xAxisConfig: {fixed: true, hideFilter: false}
            },
        });

        expect(wrapper.find("#x-axis-fg").exists()).toBe(false);
        expect(wrapper.find("#disagg-fg").exists()).toBe(true);
    });

    it("hides disaggregated by controls when disaggregated by should be fixed", () => {
        const wrapper = shallowMount(BarChartWithFilters, {
            propsData: {
                ...propsData,
                disaggregateByConfig: {fixed: true, hideFilter: false}
            },
        });

        expect(wrapper.find("#x-axis-fg").exists()).toBe(true);
        expect(wrapper.find("#disagg-fg").exists()).toBe(false);
    });

    it("can hide x axis filter", () => {
        const wrapper = shallowMount(BarChartWithFilters, {
            propsData: {
                ...propsData,
                xAxisConfig: {fixed: true, hideFilter: true}
            },
        });
        expect(wrapper.find("#filter-region").exists()).toBe(false);
        expect(wrapper.find("#filter-age").exists()).toBe(true);
    });

    it("can hide disaggregated by filter", () => {
        const wrapper = shallowMount(BarChartWithFilters, {
            propsData: {
                ...propsData,
                disaggregateByConfig: {fixed: true, hideFilter: true}
            },
        });
        expect(wrapper.find("#filter-region").exists()).toBe(true);
        expect(wrapper.find("#filter-age").exists()).toBe(false);
    });

    it("defaults all axis config to false when props are null", () => {
        const wrapper = shallowMount(BarChartWithFilters, {
            propsData: {
                ...propsData,
                xAxisConfig: null,
                disaggregateByConfig: null
            },
        });
        expect(wrapper.find("#x-axis-fg").exists()).toBe(true);
        expect(wrapper.find("#disagg-fg").exists()).toBe(true);
        expect(wrapper.find("#filter-region").exists()).toBe(true);
        expect(wrapper.find("#filter-age").exists()).toBe(true);
    });

    it("hides Filters header when all filters are hidden", () => {
        const wrapper = shallowMount(BarChartWithFilters, {
            propsData: {
                ...propsData,
                filterConfig: {
                    filters: [
                        filters[0],
                        filters[1]
                    ]
                },
                xAxisConfig: {fixed: true, hideFilter: true},
                disaggregateByConfig: {fixed: true, hideFilter: true}
            },
        });
        expect(wrapper.find("h3").exists()).toBe(false);
    });

    it("does not hide Filters header when not all filters are hidden", () => {
        const wrapper = shallowMount(BarChartWithFilters, {
            propsData: {
                ...propsData,
                xAxisConfig: {fixed: true, hideFilter: true},
                disaggregateByConfig: {fixed: true, hideFilter: true}
            },
        });
        expect(wrapper.find("h3").text()).toBe("Filters");
    });

    it("renders warning message when no data exist for current combination of filters", () => {
        const noDataMessage = "No data are available for the selected combination. Please review the combination of filter values selected."
        const wrapper = shallowMount(BarChartWithFilters, {
            propsData: {
                ...propsData,
                selections: {
                    ...propsData.selections,
                    selectedFilterOptions: {
                        region: [{id: "1", label: "Northern"}],
                        age: [{id: "0:4", label: "0-4"}],
                        sex: []
                    }
                },
                noDataMessage
            },
        });
        expect(wrapper.find("#noDataMessage").text()).toBe(noDataMessage);
    });

    it("does not render warning message when prop given but data exist for current combination of filters", () => {
        const noDataMessage = "No data are available for the selected combination. Please review the combination of filter values selected."
        const wrapper = shallowMount(BarChartWithFilters, {
            propsData: {
                ...propsData,
                noDataMessage
            },
        });
        expect(wrapper.find("#noDataMessage").exists()).toBe(false);
    });

    it("does not render warning message when no data exist for current combination of filters but prop not given", () => {
        const wrapper = shallowMount(BarChartWithFilters, {
            propsData: {
                ...propsData,
                selections: {
                    ...propsData.selections,
                    selectedFilterOptions: {
                        region: [{id: "1", label: "Northern"}],
                        age: [{id: "0:4", label: "0-4"}],
                        sex: []
                    }
                }
            },
        });
        expect(wrapper.find("#noDataMessage").exists()).toBe(false);
    });
});
