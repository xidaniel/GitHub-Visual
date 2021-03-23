import './App.css';
import { Button, Input, Table, Form } from 'antd';
import React from 'react';
import axios from 'axios';
import moment from 'moment'
import * as echarts from 'echarts'

import githubIcon from './assets/imgs/gitHub.png'
import repositoryIcon from './assets/imgs/repository.png'
import clockIcon from './assets/imgs/clock.png'
import emailIcon from './assets/imgs/email.png'
import emptyIcon from './assets/imgs/empty.png'
import APIS from './api/api';
import { validatorNumber, getCommits, softmax } from './utils'
import commitsData from './assets/commits-data'

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
    title: 'Create Time',
    key: 'created_at',
    dataIndex: 'created_at',
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
    title: 'Last Update Time',
    key: 'updated_at',
    dataIndex: 'updated_at',
    sorter: (a, b) => {
      let aTime = new Date(a.updated_at).getTime();
      let bTime = new Date(b.updated_at).getTime();
      return aTime - bTime;
    },
    render: (value) => {
      //format time 
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
    title: 'Starts',
    key: 'stargazers_count',
    dataIndex: 'stargazers_count',
    //ascending sorting
    sorter: (a, b) => a.stargazers_count - b.stargazers_count
  },
  {
    title: 'Issues',
    key: 'open_issues',
    dataIndex: 'open_issues',
    sorter: (a, b) => a.open_issues - b.open_issues
  },
  {
    title: 'Forks',
    key: 'forks_count',
    dataIndex: 'forks_count',
    sorter: (a, b) => a.forks_count - b.forks_count
  },
  {
    title: 'Commits',
    key: 'commits',
    dataIndex: 'commits',
    sorter: (a, b) => a.commits - b.commits
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
    memberList: [],
    userInfo: {}, // userInfo
    currentPage: 1,
    archivedList: [] //recommend archived repo
  }

  //react life cycle
  componentDidMount() {
    let time = localStorage.getItem('time');
    let currentTime = new Date().getTime();
    if (time) {
      // if request inteval lager than 1 hour, request again
      if (currentTime - time > (1 * 60 * 60 * 1000)) {
        this.getRepositoriesData(this.state.currentPage)
        this.getUserInfo();
        this.getMemberHeadImgList()
      } else {
        let userInfo = JSON.parse(localStorage.getItem('userInfo'));
        let repositoriesData = JSON.parse(localStorage.getItem('repositoriesData'));
        let memberList = JSON.parse(localStorage.getItem('memberList'));
        this.formatLanguagePerData(repositoriesData)
        //sort commit data, descending order, get top 10 data
        let commitTop10Arr = repositoriesData.sort((a, b) => b.commits - a.commits).slice(0, 10)
        this.setState({
          userInfo,
          memberList,
          list: repositoriesData
        })
        this.formatCommitPerData(commitTop10Arr)
      }
    } else {
      this.getRepositoriesData(this.state.currentPage)
      this.getUserInfo();
      this.getMemberHeadImgList()
    }
  }

  /*
   get user information
   */
  async getUserInfo() {
    let result = await axios.get(APIS.userInfo);
    this.setState({
      userInfo: result.data
    })

    // set current time
    localStorage.setItem('time', new Date().getTime())
    localStorage.setItem('userInfo', JSON.stringify(result.data))
  }

  /*
   get repos data
   */
  async getRepositoriesData() {
    let { list, currentPage } = this.state;
    //send request through axios
    let result = await axios.get(APIS.repositories, {
      params: {
        per_page: 100, 
        page: currentPage,
      }
    })
    let repositoriesData = result.data;
    //merge per page data
    list = [...list, ...repositoriesData];
    //update data to cache
    this.setState({ list, currentPage: currentPage + 1 }, () => {
      if (repositoriesData.length >= 100) {
        this.getRepositoriesData()
      } else {
        // //process commits data
        list.forEach(item => {
          if (commitsData[item.name] !== undefined) {
            item.commits = commitsData[item.name]
          }
        })

        // sort and get top 10 commit data
        let commitTop10Arr = list.sort((a, b) => b.commits - a.commits).slice(0, 10)
        //cache repo data
        localStorage.setItem('repositoriesData', JSON.stringify(list));
        this.formatLanguagePerData(list)
        this.formatCommitPerData(commitTop10Arr)
      }
    })

  }

  //get members data
  async getMemberHeadImgList() {
    let result = null;
    try {
      result = await axios.get(APIS.memberHeadImgs);
      this.setState({
        memberList: result.data
      })
      localStorage.setItem('memberList', JSON.stringify(result.data))

    } catch (error) {
      console.log(error);
    }
  }

  /*
    format the data for language statistics graph
    init echarts object and config echarts
    line 215 ~ 292
    */
  formatLanguagePerData(data) {
    //find unique name
    let seriesName = new Set()
    data.forEach(item => {
      seriesName.add(item.language);
    });

    //init hashtable
    let seriesObj = {};
    [...seriesName].forEach(item => {
      seriesObj[item] = {
        value: 0,
        name: item
      }
    })

    //count nums of each language
    data.forEach(item => {
      if (seriesObj[item.language]) {
        seriesObj[item.language].value = seriesObj[item.language].value + 1;
      }
    })

    //init a list as output
    let seriesData = [];
    for (const key in seriesObj) {
      seriesData.push(seriesObj[key])
    }


    const reposEchartsDom = document.getElementById('repos-echarts');
    //init echarts object
    const reposEchartsInit = echarts.init(reposEchartsDom);
    //config language echarts
    const reposEchartsOptions = {
      // backgroundColor: '#E1D9CA',
      title: {
        text: 'Repos per Language',
        x: 'center'
      },
      tooltip: {
        trigger: 'item'
      },
      legend: {
        left: 'center',
        bottom: 0,
        itemWidth: 14,
        itemHeight: 8,
        textStyle: {
          fontSize: 10
        }
      },
      series: [
        {
          name: 'Language per',
          type: 'pie',
          radius: ['40%', '60%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: false,
              fontSize: '40',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: seriesData
        }
      ]
    };
    reposEchartsInit.setOption(reposEchartsOptions)
  }

  /*
    format the data for commits statistics graph
    init echarts object and config echarts
    line 299 ~ 352
  */
  formatCommitPerData(data) {
    let seriesData = [];
    data.forEach(item => {
      seriesData.push({
        name: item.name,
        value: item.commits
      })
    })

    const reposCommitTop10 = document.getElementById('repos-commit-top10');
    const reposCommitInit = echarts.init(reposCommitTop10);
    let reposCommitsOptions = {
      title: {
        text: 'Commits per Repos(top 10)',
        x: 'center'
      },
      tooltip: {
        trigger: 'item'
      },
      legend: {
        left: 'center',
        bottom: 0,
        itemWidth: 14,
        itemHeight: 8,
        textStyle: {
          fontSize: 10
        }
      },
      series: [
        {
          name: 'Commits count',
          type: 'pie',
          radius: ['40%', '60%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: false,
              fontSize: '40',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: seriesData
        }
      ]
    };
    reposCommitInit.setOption(reposCommitsOptions)
  }

  //click member's avatar to skip
  handleToavatarGit(url) {
    window.open(url)
  }

    /*
    here to set the recommender component
    */

   //submit action
  handleSubmit({ time, Issues, Forks }) {
    let { list } = this.state;
    let archivedList = softmax(time, Issues, Forks, list);
    this.setState({ archivedList })
  }


  render() {
    let { userInfo, memberList, list, archivedList } = this.state
    return (
      <div className="App">
        <div className="title-header">
          <img src={userInfo.avatar_url} alt="头像" />
          <div className="title">{userInfo.name}</div>
        </div>
        <div className="main">
          <div className="statistics-container">
            <div className="statistics-info">
              <div>
                <h3 className="user-name">{userInfo.login}</h3>
                <div><img src={githubIcon} alt="github" />{167781} contributions on github</div>
                <div><img src={repositoryIcon} alt="repositoryIcon" />{userInfo.public_repos} public repos</div>
                <div><img src={clockIcon} alt="clockIcon" />Joined Github  {new Date().getFullYear() - new Date(userInfo.created_at).getFullYear()} years ago</div>
                <div><img className="email-icon" src={emailIcon} alt="emailIcon" />{userInfo.email || 'null'}</div>
              </div>
            </div>
            <div id="repos-commit-top10"></div>
            <div id="repos-echarts"></div>
            <div className="member-container">
              <p className="member-title">
                <span>People</span>
              </p>
              <div className="member-list">{memberList.map(item => (
                <img className="avatar" key={item.id} src={item.avatar_url} alt="avatar_url" onClick={() => this.handleToavatarGit(item.html_url)} />
              ))}</div>
            </div>
          </div>
          <div className="table-container">
            <div>
              <h3>Repos Information</h3>
              <Table className="table" size="small" rowKey="id" columns={columns} dataSource={list} />
            </div>
            <div className="archive-wrapper">
              <div className="archive-wrapper-header">
                <h3>Archived Recommender</h3>
                <Form className="weigth-form"
                  onFinish={(value) => this.handleSubmit(value)}>
                  <Form.Item
                    label="time Intervel"
                    name="time"
                    colon={false}
                    rules={[{ validator: validatorNumber }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label="Issues"
                    name="Issues"
                    colon={false}
                    rules={[{ validator: validatorNumber }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label="Forks"
                    name="Forks"
                    colon={false}
                    rules={[{ validator: validatorNumber }]}
                  >
                    <Input />
                  </Form.Item>
                  <Button className="submit-btn" htmlType="submit">GO</Button>
                </Form>
              </div>
              <div className="archive-wrapper-table">
                <div className="archive-table-header">
                  <div>Repo Name</div>
                  <div>Confidence</div>
                </div>
                {archivedList.length > 0 ?
                  <div className="archive-table-body">
                    {archivedList.map(item => (
                      <div key={item.repoName} className="archive-table-line">
                        <div>{item.repoName}</div>
                        <div>{(parseFloat(item.value) * 100).toFixed(2)}%</div>
                      </div>
                    ))}
                  </div> :
                  <img className="empty-icon" src={emptyIcon} alt="empty" />
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
