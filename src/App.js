import logo from './logo.svg';
import './App.css';
import React from 'react';
import { Table } from 'antd';
import axios from 'axios';
import moment from 'moment';
import * as echarts from 'echarts';

//import rdata from './data';


const BASE_URL = 'https://api.github.com/users/brown-ccv';


//define columns name
const columns = [
  {
    title: 'Repo Name',
    key: 'name',
    dataIndex: 'name',
    // sorting name based on 
    sorter: (a, b) => a.name.length - b.name.length
  },
  {
    title: 'Create Name',
    key: 'created_at',
    dataIndex: 'created_at',
    //sorting time from recelent time
    sorter: (a, b) => {
      let aTime = new Date(a.created_at).getTime();
      let bTime = new Date(b.created_at).getTime();
      return aTime - bTime;
    },
    render: (value) => {
      //format time 
      return moment(value).format('YYYY-MM-DD HH:mm:ss')
    }
  },
  {
    title: 'Last update time',
    key: 'updated_at',
    dataIndex: 'updated_at',
    sorter: (a, b) => {
      let aTime = new Date(a.created_at).getTime();
      let bTime = new Date(b.created_at).getTime();
      return aTime - bTime;
    },
    render: (value) => {
      // 格式化时间
      return moment(value).format('YYYY-MM-DD HH:mm:ss')
    }
  },
  {
    title: 'Language',
    key: 'language',
    dataIndex: 'language',
    //sorting
    sorter: (a, b) => {
      if (a.language && b.language) {
        return a.language.length - b.language.length
      }
    }
  },
  {
    title: 'stars',
    key: 'stargazers_count',
    dataIndex: 'stargazers_count',
    //ascending sorting
    sorter: (a, b) => a.stargazers_count - b.stargazers_count
  },
  {
    title: 'Issues',
    key: 'open_issues_count',
    dataIndex: 'open_issues_count',
    //ascending sorting
    sorter: (a, b) => a.open_issues_count - b.open_issues_count
  },
  {
    title: 'Forks',
    key: 'forks_count',
    dataIndex: 'forks_count',
    sorter: (a, b) => a.forks_count - b.forks_count
  },
  {
    title: 'Commits',
    key: 'forks_count',
    dataIndex: 'forks_count',
    sorter: (a, b) => a.forks_count - b.forks_count
  },
  {
    title: 'Archived Status',
    key: 'archived',
    dataIndex: 'archived',
    sorter: (a, b) => a.archived - b.archived,
    render: (value) => {
      return value.archived ? 'Yes' : 'No'
    }
  },
]


class App extends React.Component {
  // init data
  state = {
    list: [], // repositories
    userInfo: {}, // userInfo
    currentPage: 1
  }

  //react life cycle
  componentDidMount() {
    this.getRepositoriesData(this.state.currentPage)
    //get user info
    this.getUserInfo()
    const reposEchartsDom = document.getElementById('repos-echarts');

    //init echarts object
    const reposEchartsInit = echarts.init(reposEchartsDom);
    // config echarts
    const reposEchartsOptions = {
      tooltip: {
        trigger: 'item'
      },
      legend: {
        top: '5%',
        left: 'center'
      },
      series: [
        {
          name: '访问来源',
          type: 'pie',
          redius: ['40%', '70%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '40',
              fontWeight: 'bold'
            }
          },
          data: [
            { value: 1048, name: '搜索引擎' },
            { value: 735, name: '直接访问' },
            { value: 580, name: '邮件营销' },
            { value: 484, name: '联盟广告' },
            { value: 300, name: '视频广告' }
          ]
        }
      ]
    };
    //pass option to echarts object
    reposEchartsInit.setOption(reposEchartsOptions)
  }

  //get user's info
  async getUserInfo() {
    let result = await axios.get(BASE_URL);
    this.setState( {
      userInfo: result.data
    })
  }

  //get repos data
  async getRepositoriesData() {
    let {list, currentPage} = this.state;
    //request data through axios
    let result = await axios.get(BASE_URL + '/repos', {
      params: {
        per_page: 100, // each time request 100 data
        page: currentPage, //current page
      }
    })
    let repositoriesData = result.data;

    //merge data
    list = [...list, ...repositoriesData];
    //update date to cache
    this.setState({list, currentPage: currentPage + 1}, () => {
      //if current data more than 100, then go to next page
      if (repositoriesData.length >= 100) {
        this.getRepositoriesData();
      }
    })
  }

  render() {
    let {userInfo, list} = this.state
    return (
      <div className = "App">
        <div className = "title-header">
          <img src = {userInfo.avatar_url} alt="头像" />
          <div className = "title" > Center for Computation and Visualization,Brown University</div>
        </div>
        <div className = "statistics-container">
          <div className = "statistics-info">
            <div>
              <h3>{userInfo.login}</h3>
              <div><img src = "" alt = "" />{userInfo.public_repos} contributions on github</div>
              <div><img src = "" alt = "" />{userInfo.public_repos} public repos</div>
              <div><img src = "" alt = "" />Joined Github  {new Date().getFullYear() - new Date(userInfo.created_at).getFullYear()} years ago</div>
              <div><img src = "" alt = "" />{userInfo.email}</div>
            </div>
            <div id = "contributions-echarts"></div>
          </div>
          <div id = "repos-echarts"></div>
        </div>
        <Table rowKey = "id" columns = {columns} dataSource = {list} />
      </div>
    );
  }
}

export default App;
