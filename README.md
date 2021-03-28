# Repositories Visualization and Archived Recommendation

## About

The main objective is to develop a Front End Web Application that provides a summary or visualization that helps CCV determine which of its public repositories in the [brown-ccv GitHub organization](https://github.com/brown-ccv) could/should be archived. 

[Demo Link](http://www.algoxi.com/GitHub-Visual/)

![demo](image/demo.png)

## Built With 

The following framework, library, and tools were used to build this project.

* [React](https://reactjs.org/) 
* [Axios](https://yarnpkg.com/package/axios) 
* [Ant Design](https://ant.design/) 
* [Echarts](https://echarts.apache.org/en/index.html)
* [VSCode](https://code.visualstudio.com/)

## Features

1. Archived Recommender

   1. User can customize the weights of metrics (time interval, issues, forks).

      ```mathematica
      Input: timeWeight, issuesWeight, forksWeight
      
      Formula: timeWeight * ((now time - updated_time) / (4 * 31 * 24 * 60 * 60 * 1000)) + issuesWeight * issues + forksWeight * forks
      
      Output: value of each repo
      ```

   2. The system will generate the archived recommendation result represented by probability.

   3. The softmax function is used to calculate the relative probability of each repo. 

      <img src="image/softmax.png/" align="center" width="250" height="60">

      

2. The two statistics figures represent **Commits per Repo(top 10)** and **Repos per Language**.
   - [Doughnut Chart](https://echarts.apache.org/examples/en/editor.html?c=pie-doughnut) 

3. Repos information table to represent the detailed informations of each repo.
   - Each column has three actions: sort ascending, sort descending, and cancel sorting.
   - [Repos Table](https://ant.design/components/table/#header)

4. Grid System to make sure that every area can have stable arrangement.
   - [Grid System](https://ant.design/components/grid/)

5. Optimized data fetching latency by using caching mechanism reduced by 70%. 
   - When the user reloads the page within 60 mins, the cached data will be used directly without fetching the new data.

## Getting Started

### Prerequisites

* yarn (on mac)

  ```sh
  brew install yarn
  ```

* VSCode

### Installation

1. Clone the repo

   ```sh
   git clone https://github.com/brown-ccv-jobs/brown-rse-spring-2021-xidaniel.git
   ```

2. Install yarn packages

   ```sh
   yarn
   ```

3. Install antd design

   ```shell
   yarn add antd
   ```

4. Install axios

   ```shell
   yarn add axios
   ```

5. Install Echarts

   ```shell
   yarn add echarts --save
   ```

6. Run Project

   ```shell
   yarn start
   ```

## Deploy to GitHub Page

1. Build

   ```shell
   yarn run build
   ```

2. Install gh-pages 

   ```shell
   yarn install gh-pages --save-dev
   ```
3. Config package.json file
   - Set homepage
      ```shell
      "homepage": "https://github.com/{user name}/{repo name}.git"
      ```
   - Set scripts
     ```shell
     "predeploy": "yarn run build",
     "deploy": "gh-pages -d build"
     ```
4. Deploy
   ```shell
   yarn run deploy
   ```
5. Go Settings --> Set GitHub Pages
   ```shell
   http://www.{user}.github.io/{repo}
   ```
## Contact

Xi Wang -  xiwang3317@gmail.com
