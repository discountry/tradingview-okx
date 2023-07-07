import {
  ChartData,
  ChartMetaInfo,
  IExternalSaveLoadAdapter,
} from "@/public/static/charting_library/charting_library";

interface SaveLoadAdapter extends IExternalSaveLoadAdapter {
  charts: ChartData[];
  [key: string]: any;
}

export const save_load_adapter: SaveLoadAdapter = {
  charts: [],
  studyTemplates: [],
  drawingTemplates: [],
  chartTemplates: [],

  getAllCharts: function () {
    return Promise.resolve(this.charts as unknown as ChartMetaInfo[]);
  },

  removeChart: function (id: any) {
    for (var i = 0; i < this.charts.length; ++i) {
      if (this.charts[i].id === id) {
        this.charts.splice(i, 1);
        return Promise.resolve();
      }
    }

    return Promise.reject();
  },

  saveChart: function (chartData: ChartData) {
    if (!chartData.id) {
      chartData.id = Math.random().toString();
    } else {
      this.removeChart(chartData.id);
    }

    this.charts.push(chartData);

    return Promise.resolve(chartData.id);
  },

  getChartContent: function (id: any) {
    for (var i = 0; i < this.charts.length; ++i) {
      if (this.charts[i].id === id) {
        return Promise.resolve(this.charts[i].content);
      }
    }

    console.error("error");

    return Promise.reject();
  },

  removeStudyTemplate: function (studyTemplateData: { name: any }) {
    for (var i = 0; i < this.studyTemplates.length; ++i) {
      if (this.studyTemplates[i].name === studyTemplateData.name) {
        this.studyTemplates.splice(i, 1);
        return Promise.resolve();
      }
    }

    return Promise.reject();
  },

  getStudyTemplateContent: function (studyTemplateData: { name: any }) {
    for (var i = 0; i < this.studyTemplates.length; ++i) {
      if (this.studyTemplates[i].name === studyTemplateData.name) {
        return Promise.resolve(this.studyTemplates[i]);
      }
    }

    console.error("st: error");

    return Promise.reject();
  },

  saveStudyTemplate: function (studyTemplateData: { name: any }) {
    for (var i = 0; i < this.studyTemplates.length; ++i) {
      if (this.studyTemplates[i].name === studyTemplateData.name) {
        this.studyTemplates.splice(i, 1);
        break;
      }
    }

    this.studyTemplates.push(studyTemplateData);
    return Promise.resolve();
  },

  getAllStudyTemplates: function () {
    return Promise.resolve(this.studyTemplates);
  },

  removeDrawingTemplate: function (toolName: any, templateName: any) {
    for (var i = 0; i < this.drawingTemplates.length; ++i) {
      if (this.drawingTemplates[i].name === templateName) {
        this.drawingTemplates.splice(i, 1);
        return Promise.resolve();
      }
    }

    return Promise.reject();
  },

  loadDrawingTemplate: function (toolName: any, templateName: any) {
    for (var i = 0; i < this.drawingTemplates.length; ++i) {
      if (this.drawingTemplates[i].name === templateName) {
        return Promise.resolve(this.drawingTemplates[i].content);
      }
    }

    console.error("drawing: error");

    return Promise.reject();
  },

  saveDrawingTemplate: function (
    toolName: any,
    templateName: any,
    content: any
  ) {
    for (var i = 0; i < this.drawingTemplates.length; ++i) {
      if (this.drawingTemplates[i].name === templateName) {
        this.drawingTemplates.splice(i, 1);
        break;
      }
    }

    this.drawingTemplates.push({ name: templateName, content: content });
    return Promise.resolve();
  },

  getDrawingTemplates: function () {
    return Promise.resolve(
      this.drawingTemplates.map(function (template: { name: any }) {
        return template.name;
      })
    );
  },

  async getAllChartTemplates() {
    return this.chartTemplates.map((x: { name: any }) => x.name);
  },

  async saveChartTemplate(templateName: any, content: any) {
    const theme = this.chartTemplates.find(
      (x: { name: any }) => x.name === templateName
    );

    if (theme) {
      theme.content = content;
    } else {
      this.chartTemplates.push({ name: templateName, content });
    }
  },

  async removeChartTemplate(templateName: any) {
    this.chartTemplates = this.chartTemplates.filter(
      (x: { name: any }) => x.name !== templateName
    );
  },

  async getChartTemplateContent(templateName: any) {
    const theme = {
      content: undefined,
    };

    const content = this.chartTemplates.find(
      (x: { name: any }) => x.name === templateName
    )?.content;

    if (content) {
      theme.content = structuredClone(content);
    }

    return theme;
  },
};
