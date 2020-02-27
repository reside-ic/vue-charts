# vue-charts

## Installation
* Install from npm:
  ```
  npm install @reside-ic/vue-charts
  ```
* Import into your project and register components globally or locally:
  ```
  import {BarChartWithFilters} from "@reside-ic/vue-charts"
  
  // global
  Vue.component("bar-chart-with-filters", BarChartWithFilters)
  
  // or local
  new Vue({
    el: '#app',
    components: {
      BarChartWithFilters
    }
  })
  
  ```
* Include the following css file in your app: 
  ```
  dist/css/style.min.css
  ```
  
### Browser

To use the dynamic form component directly in the browser, 
just include `dist/js/vue-dynamic-form.min.js` on the page, after Vue and Chart.js:

```
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.7.1/Chart.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>
<script type="text/javascript" src="node_modules/@reside-ic/vue-charts/dist/vue-charts.min.js"></script>
```

In this case the component will be automatically registered. 

## Components
### BarChartWithErrors
A simple extension of the `vue-chartjs` component which includes error bars.
See [examples/barchart.html](examples/barchart.html).

### BarChartWithFilters
A fancier bar chart that gives the user control over what is plotted. At least 2 dimensions for filtering the data
must be provided. 

#### Props
This component has 4 required props.
#### chartData
The first one is the data array itself. Array item fields must include
* a value field
* a field specifying what the value means
* a lower bound for the value
* an upper bound for the value
* at least 2 other dimensions

So this is valid data:

```
[
    {
        value: 0.1, indicator: "prev", e_l: 0.09, e_h: 0.11, age: "<5", sex: "1"
    },
    {
        value: 0.2, indicator: "prev", e_l: 0.19, e_h: 0.21, age: "<5", sex: "2"
    },
    {
        value: 0.1, indicator: "inc", e_l: 0.05, e_h: 0.15, age: "<5", sex: "1"
    },
    {
        value: 0.05, indicator: "inc", e_l: 0.01, e_h: 0.07, age: "<5", sex: "2"
    }
]
```

and so is this:
```
[
    {
        count: 10, metric: "prev", lower_bound: 9, upper_bound: 11, year: 2001, country: "AFG"
    },
    {
        count: 12, metric: "prev", lower_bound: 12, upper_bound: 13, year: 2002, country: "AFG"
    }
]
```

#### indicators
The indicators prop contains metadata about the data array. It specifies the names of the 
 required fields, and which metrics to plot.

```
[{
        indicator: "prev", // id for this metric (for internal use)
        name: "Prevalence", // display name for this metric
        value_column: "value", // field containing the values
        indicator_column: "indicator", // field that specifies the meaning of the value
        indicator_value: "prev", // name of this metric
        error_low_column: "e_l", // field containing the lower bound
        error_high_column: "e_h" // field containing the upper bound
},
{
        indicator: "inc",
        name: "Incidence",
        value_column: "value",
        indicator_column: "indicator",
        indicator_value: "inc",
        error_low_column: "e_l",
        error_high_column: "e_h"
}]
```

#### filterConfig
This contains optional label text for the various filter sections, and an array of filters (must
contain at least 2.)
```
{
    indicatorLabel: "Metric", // optional, defaults to "Indicator"
    xAxisLabel: "Compare across", // optional, defaults to "X Axis"
    disaggLabel: "Disaggregate by", // optional, defaults to "Disaggregate by"
    filterLabel: "Options", // optional, defaults to "Filters"
    filters: [
        {
            id: "age",
            label: "Age",
            options: [{id: "<5", label: "<5"}, {id: "5-10", label: "5-10"}],
            column_id: "age"
        },
        {
            id: "sex",
            label: "Sex",
            options: [{id: "1", label: "male"}, {id: "2", label: "female"}],
            column_id: "sex"
        }
    ]
}
```

#### selections
Initially selected values for the x axis, disaggregation, and any filters:

```
{   
    indicatorId: "prev", // must correspond to an indicator id from indicators
    xAxisId: "age", // must correspond to a filter id from filterConfig
    disaggregateById: "sex", // must correspond to a filter id from filterConfig
    selectedFilterOptions:  {
        sex: [{id: "1", label: "male"},{id: "2", label: "male"}]
        age: [{id: "<5", label: "<5"}]
    }
}
```

For a full example see [examples/barchart.html](examples/barchart.html).




