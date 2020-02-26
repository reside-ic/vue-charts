# vue-charts

## Installation
* Install from npm:
  ```
  npm install @reside-ic/vue-charts
  ```
* Import into your project and register components globally or locally:
  ```
  import {BarChart} from "@reside-ic/vue-dynamic-form"
  
  // global
  Vue.component("bar-chart", BarChart)
  
  // or local
  new Vue({
    el: '#app',
    components: {
      BarChart
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
The data and some metadata about the structure of the data must be passed as props to the component. 
E.g. for the following data:

```
const chartData = [
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

the corresponding metadata looks like:

```
const indicators = [{
        indicator: "prev",
        value_column: "value",
        indicator_column: "indicator",
        indicator_value: "prev",
        name: "Prevalence",
        error_low_column: "e_l",
        error_high_column: "e_h"
},
{
        indicator: "inc",
        value_column: "value",
        indicator_column: "indicator",
        indicator_value: "inc",
        name: "Incidence",
        error_low_column: "e_l",
        error_high_column: "e_h"
}]
```

and the filter config:

```
{
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
See [examples/barchart.html](examples/barchart.html).




