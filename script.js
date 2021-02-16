const cardMixin = {
  props: ['site'],
  computed: {
    bgColor() {
      switch (this.site.Status) {
        case '良好':
          return 'status-aqi1';
        case '普通':
          return 'status-aqi2';
        case '對敏感族群不健康':
          return 'status-aqi3';
        case '對所有族群不健康':
          return 'status-aqi4';
        case '非常不健康':
          return 'status-aqi5';
        case '危害':
          return 'status-aqi6';
      }
    },
  },
};

const baseCard = {
  template: `
    <div class="card" :class="bgColor">
      <div class="card-header">
        {{ site.County }} - {{ site.SiteName }}
        <a href="#" class="float-right"><i class="far fa-star" @click.prevent="$emit('starred', site.SiteName)"></i></a>
      </div>
      <div class="card-body">
        <ul class="list-unstyled">
          <li>AQI 指數: {{ site.AQI }}</li>
          <li>PM2.5: {{ site["PM2.5"] }}</li>
          <li>說明: {{ site.Status }}</li>
        </ul>
        {{ site.PublishTime }}
      </div>
    </div> 
  `,
  mixins: [cardMixin],
};

const concernedCard = {
  template: `
    <div class="card" :class="bgColor">
      <div class="card-header">
        {{ site.County }} - {{ site.SiteName }}
        <a href="#" class="float-right"><i class="fas fa-star" @click.prevent="$emit('unstarred', site.SiteName)"></i></a>
      </div>
      <div class="card-body">
        <ul class="list-unstyled">
          <li>AQI 指數: {{ site.AQI }}</li>
          <li>PM2.5: {{ site["PM2.5"] }}</li>
          <li>說明: {{ site.Status }}</li>
        </ul>
        {{ site.PublishTime }}
      </div>
    </div> 
  `,
  mixins: [cardMixin],
};

const app = new Vue({
  el: '#app',
  data: {
    data: [],
    concernedData: [],
    location: [],
    stared: [],
    filter: '',
    state: 'loading',
  },
  components: {
    baseCard,
    concernedCard,
  },

  computed: {
    filteredData() {
      const vm = this;
      return this.data.filter(
        (item) => vm.filter === '' || item.County === vm.filter
      );
    },
  },

  methods: {
    getData() {
      const vm = this;
      const api = 'https://opendata2.epa.gov.tw/AQI.json';

      // 使用 Axios ajax
      axios
        .get(api)
        .then(function (response) {
          return response.data;
          // console.log(response);
        })
        .then((data) => {
          for (let i = 0; i < data.length; i++) {
            data[i].Index = i;
          }
          vm.data = data;
          console.log(vm.data);
          const tmpArr = data.map((site) => {
            return site.County;
          });
          // console.log(tmpArr);
          vm.location = tmpArr.filter((val, idx, arr) => {
            return arr.indexOf(val) === idx; // 取出第一次出現的縣市
          });
          // console.log(vm.location);
          vm.loadConcernedData();
          vm.state = 'active';
        })
        .catch((err) => {
          vm.state = 'fail';
          console.log('Error: ', err);
        });
    },

    getConcerned(name) {
      const idx = this.data.findIndex((site) => site.SiteName === name);
      this.concernedData.push(this.data[idx]);
      this.data.splice(idx, 1);
      this.storeConcernedData();
    },

    removeConcerned(name) {
      const idx = this.concernedData.findIndex(
        (site) => site.SiteName === name
      );
      const site = this.concernedData[idx];
      this.concernedData.splice(idx, 1);
      this.data.splice(site.Index, 0, site);
      this.storeConcernedData();
    },

    storeConcernedData() {
      localStorage.setItem('aqi-concerned', JSON.stringify(this.concernedData));
    },

    loadConcernedData() {
      const str = localStorage.getItem('aqi-concerned');
      const localData = JSON.parse(str);
      this.concernedData = !localData ? [] : localData;
      if (this.concernedData.length > 0) {
        this.concernedData.forEach((item) => {
          const idx = item.Index;
          this.data.splice(idx, 1);
        });
      }
    },
  },

  created() {
    this.getData();
  },
});
