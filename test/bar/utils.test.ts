import {getProcessedOutputData, toFilterLabelLookup} from "../../src/bar/utils";

export const data = [
    {area_id: 1, age_group: '0:4', sex: 'female', indicator: 2, mean: 0.40, high: 0.43, low: 0.38},
    {area_id: 1, age_group: '5:9', sex: 'female', indicator: 2, mean: 0.20, high: 0.24, low: 0.16},
    {area_id: 1, age_group: '0:4', sex: 'male', indicator: 2, mean: 0.35, high: 0.40, low: 0.34},
    {area_id: 1, age_group: '5:9', sex: 'male', indicator: 2, mean: 0.25, high: 0.28, low: 0.21},
    {area_id: 1, age_group: '0:4', sex: 'female', indicator: 3, mean: 0.20, high: 0.22, low: 0.18},
    {area_id: 1, age_group: '5:9', sex: 'female', indicator: 3, mean: 0.10, high: 0.14, low: 0.06},
    {area_id: 1, age_group: '0:4', sex: 'male', indicator: 3, mean: 0.25, high: 0.30, low: 0.21},
    {area_id: 1, age_group: '5:9', sex: 'male', indicator: 3, mean: 0.15, high: 0.2, low: 0.13},
    {area_id: 2, age_group: '0:4', sex: 'female', indicator: 2, mean: 0.50, high: 0.53, low: 0.48},
    {area_id: 2, age_group: '5:9', sex: 'female', indicator: 2, mean: 0.25, high: 0.29, low: 0.21},
];

export const filters = [
    {
        id: "region",
        column_id: "area_id",
        label: "Region",
        options: [
            {id: "1", label: "Northern"},
            {id: "2", label: "Central"}
        ]
    },
    {
        id: "age",
        column_id: "age_group",
        label: "Age group",
        options: [
            {id: "0:4", label: "0-4"},
            {id: "5:9", label: "5-9"}
        ]
    },
    {
        id: "sex",
        column_id: "sex",
        label: "Sex",
        options: [
            {id: "female", label: "female"},
            {id: "both", label: "both"},
            {id: "male", label: "male"}
        ]
    }
];

describe("Barchart utils", () => {

    const xAxis = "age";
    const disAggBy = "sex";
    const indicator = {
        indicator: "art_cov",
        value_column: "mean",
        indicator_column: "indicator",
        indicator_value: "2",
        name: "ART coverage",
        error_low_column: "low",
        error_high_column: "high",
        format: "0.00",
        scale: 1,
        accuracy: null
    };

    const selectedFilterValues = {
        region: [{id: "1", label: "Northern"}],
        age: [{id: "5:9", label: "5-9"}],
        sex: [{id: "female", label: "female"}, {id: "male", label: "male"}],
    };

    const barLabelLookup = {female: "female", male: "male"};
    const xAxisLabelLookup = {"0:4": "0-4", "5:9": "5-9"};
    const xAxisLabels = ["5-9"];
    const xAxisValues = ["5:9"];

    it("gets processed output data", () => {

        const result = getProcessedOutputData(data, xAxis, disAggBy, indicator, filters, selectedFilterValues,
            barLabelLookup, xAxisLabelLookup, xAxisLabels, xAxisValues);

        expect(result).toStrictEqual({
            labels: ["5-9"],
            datasets: [
                {
                    label: "female",
                    backgroundColor: "#e41a1c",
                    data: [0.20],
                    errorBars: {"5-9": {plus: 0.24, minus: 0.16}}
                },
                {
                    label: "male",
                    backgroundColor: "#377eb8",
                    data: [0.25],
                    errorBars: {"5-9": {plus: 0.28, minus: 0.21}}
                }
            ],
            maxValuePlusError: 0.28
        });

    });

    it("omits rows with null or undefined values", () => {

        const data = [
            {area_id: 1, age_group: '5:9', sex: 'female', indicator: 2, high: 0.43, low: 0.38},
            {area_id: 1, age_group: '5:9', sex: 'female', indicator: 2, mean: null, high: 0.24, low: 0.16}];

        const result = getProcessedOutputData(data, xAxis, disAggBy, indicator, filters, selectedFilterValues,
            barLabelLookup, xAxisLabelLookup, xAxisLabels, xAxisValues);

        expect(result).toStrictEqual({
            labels: ["5-9"],
            datasets: [{
                "backgroundColor": "#e41a1c",
                "data": [],
                "errorBars": {},
                "label": "female",
            }],
            maxValuePlusError: 0
        });
    });

    it("toFilterLabelLookup converts array", () => {
        const result = toFilterLabelLookup([
            {id: "id1", label: "label1"},
            {id: "id2", label: "label2"}
        ]);
        expect(result).toStrictEqual({id1: "label1", id2: "label2"});
    });
});
