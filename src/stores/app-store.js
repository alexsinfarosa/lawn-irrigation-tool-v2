import { observable, action, computed } from "mobx";
import { states } from "../states";

export default class AppStore {
  // SVG -------------------------------------------------------------------------------------
  @observable width = 500;
  @observable height = 500;
  // logic------------------------------------------------------------------------------------
  @observable protocol = window.location.protocol;

  //State--------------------------------------------------------------------------------------
  @observable state = JSON.parse(localStorage.getItem("state")) || {};
  @action setState = stateName => {
    this.state = states.filter(state => state.name === stateName)[0];
    localStorage.setItem("state", JSON.stringify(this.state));
  };
  @observable selectState = this.state.name ? true : false;
  @action setSelectState = d => {
    this.selectState = d;
    if (this.isLoading) {
      this.setIsMap();
    }
  };

  //Station---------------------------------------------------------------------------------
  @observable stations = [
    {
      name: "Boston Logan",
      state: "MA",
      sid: "bosthr",
      lon: -71.01056,
      lat: 42.36056
    },
    {
      name: "Hartford",
      state: "CT",
      sid: "bdlthr",
      lon: -86.1403,
      lat: 42.2275
    },
    {
      name: "Isip",
      sid: "ispthr",
      lon: -73.10167,
      lat: 40.79389
    },
    {
      name: "NYC-Central Park",
      state: "NY",
      sid: "nycthr",
      lon: -73.96917,
      lat: 40.77889
    },
    {
      name: "Philadelphia",
      state: "PA",
      sid: "phlthr",
      lon: -75.02,
      lat: 40.08
    },
    {
      name: "Providence",
      state: "RI",
      sid: "pvdthr",
      lon: -71.43333,
      lat: 41.71667
    }
  ];
  @action setStations = d => this.stations = d;
  @computed get getCurrentStateStations() {
    return this.stations.filter(
      station => station.state === this.state.postalCode
    );
  }
  @observable station = JSON.parse(localStorage.getItem("station")) || {};
  @action setStation = d => {
    this.station = d;
    localStorage.setItem("station", JSON.stringify(this.station));
  };
  @observable selectStation = this.station.name ? true : false;
  @action setSelectStation = d => this.selectStation = d;

  // Data -----------------------------------------------------------------------------------
  @observable observedData = [];
  @action setObservedData = d => this.observedData = d;

  @observable days = 0;
  @action setDays = d => this.days = d;

  @observable projectedData1 = [];
  @action setProjectedData1 = d => this.projectedData1 = d;

  @observable projectedData2 = [];
  @action setProjectedData2 = d => this.projectedData2 = d;

  // Slider -------------------------------------------------------------------------------------
  @observable temperature = 90;
  @action setTemperature = d => this.temperature = d;
}
