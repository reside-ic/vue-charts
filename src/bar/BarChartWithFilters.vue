<template>
    <div>
        <div v-if="initialised" class="row">
            <div class="col-md-3">
                <div id="indicator-fg" class="form-group">
                    <label class="font-weight-bold">{{filterConfig.indicatorLabel || "Indicator"}}</label>
                    <tree-select :multiple=false
                                 :clearable="false"
                                 :options="indicators"
                                 v-model="indicatorId"
                                 :normalizer="normalizeIndicators"></tree-select>
                </div>
                <div v-if="!(xAxisConfig && xAxisConfig.fixed)" id="x-axis-fg" class="form-group">
                    <label class="font-weight-bold">{{filterConfig.xAxisLabel || "X Axis"}}</label>
                    <tree-select :multiple=false
                                 :clearable="false"
                                 :options="filtersAsOptions"
                                 v-model="xAxisId"></tree-select>
                </div>
                <div v-if="!(disaggregateByConfig && disaggregateByConfig.fixed)" id="disagg-fg" class="form-group">
                    <label class="font-weight-bold">{{filterConfig.disaggLabel || "Disaggregate by"}}</label>
                    <tree-select :multiple=false
                                 :clearable="false"
                                 :options="filtersAsOptions"
                                 v-model="disaggregateById"></tree-select>
                </div>
                <hr/>
                <h3 v-if="anyFiltersShown">{{filterConfig.filterLabel || "Filters"}}</h3>
                <div :id="'filter-' + filter.id"
                     v-for="filter in filterConfig.filters"
                     v-if="filterIsShown(filter.id)"
                     class="form-group">
                    <filter-select :value="getSelectedFilterOptions(filter.id)"
                                   :is-disaggregate-by="filter.id === selections.disaggregateById"
                                   :is-x-axis="filter.id === selections.xAxisId"
                                   :label="filter.label"
                                   :options="filter.options"
                                   @input="changeFilter(filter.id, $event)"></filter-select>
                </div>
            </div>
            <div v-if="!!xAxisLabel" id="chart" class="col-md-9">
                <bar-chart-with-errors
                        :chart-data="processedOutputData"
                        :xLabel="xAxisLabel"
                        :yLabel="indicatorLabel"
                        :yFormat="formatValueFunction"
                        style="width: 100%; height: 100%;"></bar-chart-with-errors>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import TreeSelect from '@riophae/vue-treeselect';
    import BarChartWithErrors from "./BarChartWithErrors";
    import FilterSelect from "./FilterSelect.vue";
    import {AxisConfig, BarchartIndicator, BarchartSelections, Dict, Filter, FilterConfig, FilterOption} from "./types";
    import {getProcessedOutputData, toFilterLabelLookup} from "./utils";

    interface Props {
        chartData: any[],
        filterConfig: FilterConfig,
        indicators: BarchartIndicator[],
        selections: BarchartSelections,
        formatFunction: (value: string | number, indicator: BarchartIndicator) => string,
        xAxisConfig: AxisConfig | null,
        disaggregateByConfig: AxisConfig | null
    }

    interface Methods {
        normalizeIndicators: (node: BarchartIndicator) => FilterOption,
        changeSelections: (newSelections: Partial<BarchartSelections>) => void,
        changeFilter: (filterId: any, selectedOptions: any) => void,
        getSelectedFilterOptions: (filterId: string) => FilterOption[],
        filterIsShown: (filterId: string) => boolean
    }

    interface Computed {
        indicatorId: string,
        xAxisId: string,
        disaggregateById: string,
        xAxisLabel: string,
        indicatorLabel: string,
        filtersAsOptions: FilterOption[]
        indicator: BarchartIndicator
        processedOutputData: any
        xAxisLabels: string[]
        xAxisValues: string[]
        xAxisLabelLookup: { [key: string]: string }
        barLabelLookup: { [key: string]: string }
        initialised: boolean,
        formatValueFunction: (value: string | number) => string,
        anyFiltersShown: boolean
    }

    const props = {
        chartData: {
            type: Array
        },
        filterConfig: {
            type: Object
        },
        indicators: {
            type: Array
        },
        selections: {
            type: Object
        },
        formatFunction: {
            type: Function
        },
        xAxisConfig: {
            type: Object
        },
        disaggregateByConfig: {
            type: Object
        }
    };

    export default Vue.extend<{}, Methods, Computed, Props>({
        name: "BarChart",
        props: props,
        model: {
            prop: "selections",
            event: "change"
        },
        computed: {
            indicatorId: {
                get() {
                    return this.selections.indicatorId;
                },
                set(value: string) {
                    this.changeSelections({indicatorId: value});
                }
            },
            xAxisId: {
                get() {
                    return this.selections.xAxisId;
                },
                set(value: string) {
                    this.changeSelections({xAxisId: value});
                }
            },
            disaggregateById: {
                get() {
                    return this.selections.disaggregateById;
                },
                set(value: string) {
                    this.changeSelections({disaggregateById: value});
                }
            },
            xAxisLabel() {
                const filter = this.filtersAsOptions.find((f: FilterOption) => f.id == this.selections.xAxisId);
                return filter ? filter.label : "";
            },
            indicatorLabel() {
                return this.indicator ? this.indicator.name : "";
            },
            xAxisLabels() {
                const options = this.selections.selectedFilterOptions[this.selections.xAxisId];
                return options ? options.map((o: FilterOption) => o.label) : [];
            },
            xAxisValues() {
                const options = this.selections.selectedFilterOptions[this.selections.xAxisId];
                return options ? options.map((o: FilterOption) => o.id) : [];
            },
            barLabelLookup() {
                return toFilterLabelLookup(this.selections.selectedFilterOptions[this.selections.disaggregateById] || []);
            },
            xAxisLabelLookup() {
                return toFilterLabelLookup(this.selections.selectedFilterOptions[this.selections.xAxisId] || []);
            },
            filtersAsOptions() {
                return this.filterConfig.filters.map((f: Filter) => ({id: f.id, label: f.label}))
            },
            processedOutputData() {
                return this.initialised ? getProcessedOutputData(
                    this.chartData,
                    this.selections.xAxisId,
                    this.selections.disaggregateById,
                    this.indicator,
                    this.filterConfig.filters,
                    this.selections.selectedFilterOptions,
                    this.barLabelLookup,
                    this.xAxisLabelLookup,
                    this.xAxisLabels,
                    this.xAxisValues) : {};
            },
            indicator() {
                return this.indicators.find((i: BarchartIndicator) => i.indicator == this.selections.indicatorId)!!
            },
            formatValueFunction() {
                if (this.formatFunction) {
                    return (value: string | number) => this.formatFunction(value, this.indicator);
                } else {
                    return (value: string | number) => value.toString();
                }
            },
            initialised() {
                const unsetFilters = this.filterConfig.filters.filter((f: Filter) => !this.selections.selectedFilterOptions[f.id]);
                return !!this.selections.indicatorId && !!this.selections.xAxisId && !!this.selections.disaggregateById
                    && unsetFilters.length == 0;
            },
            anyFiltersShown() {
                return this.filterConfig.filters.some((f: Filter) => this.filterIsShown(f.id));
            }
        },
        methods: {
            normalizeIndicators(node: BarchartIndicator) {
                return {id: node.indicator, label: node.name};
            },
            changeSelections(newSelections: Partial<BarchartSelections>) {
                this.$emit("change", {...this.selections, ...newSelections});
                this.$emit("update", newSelections)
            },
            changeFilter(filterId: any, selectedOptions: any) {
                const newSelectedFilterOptions = {...this.selections.selectedFilterOptions};
                newSelectedFilterOptions[filterId] = selectedOptions;
                this.changeSelections({...this.selections, selectedFilterOptions: newSelectedFilterOptions});
            },
            getSelectedFilterOptions(filterId: string) {
                return (this.selections.selectedFilterOptions[filterId]) || [];
            },
            filterIsShown(filterId: string) {
                const filterHiddenForConfig = (config: AxisConfig | null, relevantFilterId: string) => {
                    return (filterId === relevantFilterId) && config && config.hideFilter;
                };
                return !filterHiddenForConfig(this.xAxisConfig, this.xAxisId) &&
                    !filterHiddenForConfig(this.disaggregateByConfig, this.disaggregateById);
            }
        },
        created() {
            //If selections have not been initialised, refresh them, and emit changed events
            if (!this.selections.indicatorId) {
                this.indicatorId = this.indicators[0].indicator;
            }

            if (!this.selections.xAxisId) {
                this.xAxisId = this.filterConfig.filters[0].id;
            }

            if (!this.selections.disaggregateById) {
                this.disaggregateById = this.filterConfig.filters[1].id;
            }

            if (Object.keys(this.selections.selectedFilterOptions).length < 1) {
                const defaultSelected = this.filterConfig.filters.reduce((obj: any, current: Filter) => {
                    obj[current.id] = [current.options[0]];
                    return obj;
                }, {} as Dict<FilterOption[]>);
                this.changeSelections({selectedFilterOptions: defaultSelected});
            }
        },
        components: {
            BarChartWithErrors,
            TreeSelect,
            FilterSelect
        }
    });
</script>
