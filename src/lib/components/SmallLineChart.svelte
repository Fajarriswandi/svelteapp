
 <script lang="ts">
     import { onMount, onDestroy } from 'svelte';
     import * as am5 from '@amcharts/amcharts5';
     import * as am5xy from '@amcharts/amcharts5/xy';
     import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';

     export let chartId: string;
     export let chartData: { date: string; value: number }[];

     let root: am5.Root;
     let series: am5xy.LineSeries;
     let chart: am5xy.XYChart;

     onMount(() => {
         console.log(`DEBUG SmallLineChart (${chartId}): onMount - Chart data received:`, chartData);
         console.log(
             `DEBUG SmallLineChart (${chartId}): onMount - Chart data length:`,
             chartData.length
         );

         if (!chartData || chartData.length === 0) {
             console.warn(
                 `WARN SmallLineChart (${chartId}): No initial chart data provided or data is empty. Chart might be empty.`
             );
         }

         root = am5.Root.new(chartId);
         console.log(`DEBUG SmallLineChart (${chartId}): am5.Root created for ID: ${chartId}`);

         root.setThemes([am5themes_Animated.new(root)]);
         console.log(`DEBUG SmallLineChart (${chartId}): Themes set.`);

         root.dateFormatter.setAll({
             dateFormat: 'yyyy-MM-dd',
             dateFields: ['valueX']
         });
         console.log(`DEBUG SmallLineChart (${chartId}): Date formatter set to 'yyyy-MM-dd'.`);

         chart = root.container.children.push(
             am5xy.XYChart.new(root, {
                 focusable: true,
                 panX: true,
                 panY: false,
                 wheelX: 'panX',
                 wheelY: 'zoomX',
                 pinchZoomX: true,
                 paddingLeft: 0,
                 paddingRight: 0,
                 paddingTop: 10,
                 paddingBottom: 0
             })
         );
         console.log(`DEBUG SmallLineChart (${chartId}): XYChart created.`);

         var xAxis = chart.xAxes.push(
             am5xy.DateAxis.new(root, {
                 maxDeviation: 0.1,
                 groupData: true,
                 baseInterval: {
                     timeUnit: 'day',
                     count: 1
                 },
                 renderer: am5xy.AxisRendererX.new(root, {
                     minorGridEnabled: false,
                     minGridDistance: 70,
                     strokeOpacity: 0,
                     labels: {
                         template: am5.Label.new(root, {
                             fill: am5.color(0x999999),
                             fontSize: 11,
                             minPosition: 0.01,
                             maxPosition: 0.99
                         }),
                         dateFormats: {
                             day: { dateFormat: '%b %d' },
                             week: { dateFormat: '%b %d' },
                             month: { dateFormat: '%b' },
                             year: { dateFormat: '%Y' }
                         },
                         periodChangeDateFormats: {
                             day: { dateFormat: '%b %d' },
                             week: { dateFormat: '%b %d' },
                             month: { dateFormat: '%b' },
                             year: { dateFormat: '%Y' }
                         }
                     }
                 }),
                 tooltip: am5.Tooltip.new(root, {})
             })
         );
         console.log(`DEBUG SmallLineChart (${chartId}): X-Axis (DateAxis) created.`);

         var yAxis = chart.yAxes.push(
             am5xy.ValueAxis.new(root, {
                 maxDeviation: 0.2,
                 renderer: am5xy.AxisRendererY.new(root, {
                     opposite: false,
                     strokeOpacity: 0,
                     labels: {
                         template: am5.Label.new(root, {
                             fill: am5.color(0x999999),
                             fontSize: 11
                         })
                     }
                 })
             })
         );
         console.log(`DEBUG SmallLineChart (${chartId}): Y-Axis (ValueAxis) created.`);

         series = chart.series.push(
             am5xy.LineSeries.new(root, {
                 minBulletDistance: 10,
                 connect: true,
                 xAxis: xAxis,
                 yAxis: yAxis,
                 valueYField: 'value',
                 valueXField: 'date',
                 tooltip: am5.Tooltip.new(root, {
                     pointerOrientation: 'horizontal',
                     labelText: '{valueY}'
                 })
             })
         );
         console.log(`DEBUG SmallLineChart (${chartId}): LineSeries created.`);

         series.fills.template.setAll({
             fillOpacity: 0.2,
             visible: true,
             fill: am5.color(0x88eeff)
         });

         series.strokes.template.setAll({
             strokeWidth: 2,
             stroke: am5.color(0x00a0e1)
         });

         series.data.processor = am5.DataProcessor.new(root, {
             dateFormat: 'yyyy-MM-dd',
             dateFields: ['date'],
             numericFields: ['value']
         });
         console.log(
             `DEBUG SmallLineChart (${chartId}): Data processor configured for dates and values.`
         );

         // Initial data set
         series.data.setAll(chartData);
         console.log(
             `DEBUG SmallLineChart (${chartId}): Initial data set to series. First data point:`,
             chartData[0]
         );
         console.log(
             `DEBUG SmallLineChart (${chartId}): Last data point:`,
             chartData[chartData.length - 1]
         );

         series.bullets.push(function () {
             var circle = am5.Circle.new(root, {
                 radius: 4,
                 fill: root.interfaceColors.get('background'),
                 stroke: series.get('stroke'),
                 strokeWidth: 2
             });
             return am5.Bullet.new(root, {
                 sprite: circle
             });
         });
         console.log(`DEBUG SmallLineChart (${chartId}): Bullets added.`);

         var cursor = chart.set(
             'cursor',
             am5xy.XYCursor.new(root, {
                 xAxis: xAxis,
                 behavior: 'zoomX'
             })
         );
         cursor.lineY.set('visible', false);
         console.log(`DEBUG SmallLineChart (${chartId}): XYCursor added with zoomX behavior.`);

         if (chart.get('scrollbarX')) {
             chart.set('scrollbarX', undefined);
         }
         if (chart.get('scrollbarY')) {
             chart.set('scrollbarY', undefined);
         }
         console.log(`DEBUG SmallLineChart (${chartId}): Scrollbars removed.`);

         chart.appear(1000, 100);
         series.appear(1000);
         console.log(`DEBUG SmallLineChart (${chartId}): Chart and Series appear animation triggered.`);
     });

    // --- Menggunakan $effect untuk bereaksi terhadap perubahan chartData ---
    $: {
        // Log untuk memastikan $effect terpicu
        console.log(`DEBUG SmallLineChart (${chartId}): Reactive block triggered.`);
        if (root && series) { // Pastikan root dan series sudah diinisialisasi
            console.log(`DEBUG SmallLineChart (${chartId}): $effect - root and series exist.`);
            // amCharts lebih baik jika diberikan array baru atau setidaknya di-set ulang.
            // Gunakan setAll() dengan data baru.
            if (chartData && chartData.length > 0) {
                console.log(`DEBUG SmallLineChart (${chartId}): $effect - Updating series with new data. Length:`, chartData.length);
                series.data.setAll(chartData);
                // Penting: Resetting axis ranges after data update if needed
                // This ensures the chart adapts to the new data's min/max values and date range
                // Try commenting this out first, and if still not reactive, uncomment.
                // It might make the chart "jump" if data range changes dramatically.
                // root.events.once("frameended", () => {
                //     root.events.disableType("frameended");
                //     root.events.once("ended", () => {
                //         chart.xAxes.each(function(axis) {
                //             axis.zoomToCategories(chartData[0].date, chartData[chartData.length - 1].date);
                //         });
                //     });
                // });

                series.appear(100); // Re-animate for smooth transition
            } else {
                // Jika data kosong, bersihkan series atau tampilkan pesan kosong
                console.warn(`WARN SmallLineChart (${chartId}): chartData is empty. Clearing series data.`);
                series.data.setAll([]);
            }
        } else {
            console.log(`DEBUG SmallLineChart (${chartId}): $effect - root or series not initialized yet.`);
        }
    }


     onDestroy(() => {
         if (root) {
             console.log(`DEBUG SmallLineChart (${chartId}): onDestroy - Disposing chart root.`);
             root.dispose();
         }
     });
 </script>

 <div id={chartId} style="width: 100%; height: 200px;"></div>