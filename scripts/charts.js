const moment = require('moment')


hexo.extend.generator.register('charts', function (locals) {
  let script = postsChart('2020-06') + tagsChart(10) + categoriesChart();
  return {
      path: 'js/charts.js',
      data: script
  }
})

function postsChart (startMonth) {
  const startDate = moment(startMonth || '2020-06')
  const endDate = moment()

  const monthMap = new Map()
  const dayTime = 3600 * 24 * 1000
  for (let time = startDate; time <= endDate; time += dayTime) {
    const month = moment(time).format('YYYY-MM')
    if (!monthMap.has(month)) {
      monthMap.set(month, 0)
    }
  }
  hexo.locals.get('posts').forEach(function (post) {
    const month = post.date.format('YYYY-MM')
    if (monthMap.has(month)) {
      monthMap.set(month, monthMap.get(month) + 1)
    }
  })
  const monthArr = JSON.stringify([...monthMap.keys()])
  const monthValueArr = JSON.stringify([...monthMap.values()])

  return `
    let color = 'rgb(252, 103, 250)', color1 = 'rgba(78, 84, 200)', color2 = 'rgba(143, 148, 251)';
    let postsOption = {
        title: {
            text: '文章发布时间统计图',
            x: 'center',
            textStyle: {
                color: color
            }
        },
        tooltip: {
            trigger: 'axis'
        },
        xAxis: {
            name: '日期',
            type: 'category',
            boundaryGap: false,
            nameTextStyle: {
                color: color
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              show: true,
              color: color
            },
            axisLine: {
              show: true,
              lineStyle: {
                color: color
              }
            },
            data: ${monthArr}
          },
        yAxis: {
            name: '文章数量',
            type: 'value',
            nameTextStyle: {
              color: color
            },
            splitLine: {
              show: false
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              show: true,
              color: color
            },
            axisLine: {
              show: true,
              lineStyle: {
                color: color
              }
            }
        },
        series: [
            {
                name: '文章数量',
                type: 'line',
                smooth: true,
                lineStyle: {
                    width: 0
                },
                showSymbol: false,
                color: ['#6772e5'],
                data: ${monthValueArr},
                markLine: {
                    data: [{
                      name: '平均值',
                      type: 'average',
                      label: {
                        color: color
                      }
                    }],
                    itemStyle: {color: [color]}
                },
                itemStyle: {
                    opacity: 1,
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                      offset: 0,
                      color: color1
                    },
                    {
                      offset: 1,
                      color: color2
                    }])
                },
                areaStyle: {
                    opacity: 1,
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                        offset: 0,
                        color: color1
                    }, {
                        offset: 1,
                        color: color2
                    }])
                }
            }
        ]
    };
    `
}

function tagsChart (dataLength = 10) {
  const tagArr = []
  hexo.locals.get('tags').map(function (tag) {
    tagArr.push({ name: tag.name, value: tag.length })
  })
  tagArr.sort((a, b) => { return b.value - a.value })

  const tagNameArr = []
  const tagCountArr = []
  for (let i = 0, len = Math.min(tagArr.length, dataLength); i < len; i++) {
    tagNameArr.push(tagArr[i].name)
    tagCountArr.push(tagArr[i].value)
  }

  const tagNameArrJson = JSON.stringify(tagNameArr)
  const tagCountArrJson = JSON.stringify(tagCountArr)
  return `
    let tagsOption = {
        title: {
          text: 'Top ${dataLength} 标签统计图',
          x: 'center',
          textStyle: {
            color: color
          }
        },
        tooltip: {},
        xAxis: {
          name: '标签',
          type: 'category',
          nameTextStyle: {
            color: color
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            show: true,
            color: color,
            interval: 0
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: color
            }
          },
          data: ${tagNameArrJson}
        },
        yAxis: {
          name: '文章数量',
          type: 'value',
          splitLine: {
            show: false
          },
          nameTextStyle: {
            color: color
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            show: true,
            color: color
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: color
            }
          }
        },
        series: [{
          name: '文章数量',
          type: 'bar',
          data: ${tagCountArrJson},
          itemStyle: {
            borderRadius: [5, 5, 0, 0],
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
              offset: 0,
              color: color1
            },
            {
              offset: 1,
              color: color2
            }])
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                offset: 0,
                color: color1
              },
              {
                offset: 1,
                color: color2
              }])
            }
          },
          markLine: {
            data: [{
              name: '平均值',
              type: 'average',
              label: {
                color: color
              },
              itemStyle: {color: [color]}
            }]
          }
        }]
      };
    `
}

function categoriesChart (dataParent) {
    const categoryArr = []
    let categoryParentFlag = false
    hexo.locals.get('categories').map(function (category) {
      if (category.parent) categoryParentFlag = true
      categoryArr.push({
        name: category.name,
        value: category.length,
        path: category.path,
        id: category._id,
        parentId: category.parent || '0'
      })
    })
    categoryParentFlag = categoryParentFlag && dataParent === 'true'
    categoryArr.sort((a, b) => { return b.value - a.value })
    function translateListToTree (data, parent) {
      let tree = []
      let temp
      data.forEach((item, index) => {
        if (data[index].parentId == parent) {
          let obj = data[index];
          temp = translateListToTree(data, data[index].id);
          if (temp.length > 0) {
            obj.children = temp
          }
          if (tree.indexOf())
            tree.push(obj)
        }
      })
      return tree
    }
    const categoryNameJson = JSON.stringify(categoryArr.map(function (category) { return category.name }))
    const categoryArrJson = JSON.stringify(categoryArr)
    const categoryArrParentJson = JSON.stringify(translateListToTree(categoryArr, '0'))
  
    return `
      let categoryParentFlag = ${categoryParentFlag}
      let categoriesOption = {
        title: {
          text: '文章分类统计图',
          x: 'center',
          textStyle: {
            color: color
          }
        },
        legend: {
          top: 'bottom',
          data: ${categoryNameJson},
          textStyle: {
            color: color
          }
        },
        tooltip: {
          trigger: 'item'
        },
        series: []
      };
      categoriesOption.series.push(
        categoryParentFlag ? 
        {
          nodeClick :false,
          name: '文章篇数',
          type: 'sunburst',
          radius: ['15%', '90%'],
          center: ['50%', '55%'],
          sort: 'desc',
          data: ${categoryArrParentJson},
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 2,
            emphasis: {
              focus: 'ancestor',
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(255, 255, 255, 0.5)'
            }
          }
        }
        :
        {
          name: '文章篇数',
          type: 'pie',
          radius: [30, 80],
          roseType: 'area',
          label: {
            color: color,
            formatter: '{b} : {c} ({d}%)'
          },
          data: ${categoryArrJson},
          itemStyle: {
            emphasis: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(255, 255, 255, 0.5)'
            }
          }
        }
      )
      `
  }