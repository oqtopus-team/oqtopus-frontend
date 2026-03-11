import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { GridComponent, ToolboxComponent, TooltipComponent } from 'echarts/components';
import { SVGRenderer } from 'echarts/renderers';

echarts.use([BarChart, GridComponent, ToolboxComponent, TooltipComponent, SVGRenderer]);

export default echarts;
