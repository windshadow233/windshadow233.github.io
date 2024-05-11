---
title: 关于我
date: 2024-04-10 16:12:45
comments: false
aside: false
---


```python
import random


class Myself(Human):

    def __init__(self):
        super(Myself, self).__init__()
        self.username = 'WindShadow'
        self.username_cn = '风的影子'
        self.birthday = 919526400
        self.gpg_pub_key = 'https://keys.openpgp.org/vks/v1/by-fingerprint/B4ADB2D4BB3EBD5E387BA401B8674F373ACBD2AD'

    @property
    def mbti(self):
        """
        Mostly INFP-A, sometimes ISFP-A, details at:

        https://www.16personalities.com/infp-personality
        https://www.16personalities.com/articles/assertive-mediator-infp-a-vs-turbulent-mediator-infp-t
        https://www.16personalities.com/isfp-personality
        https://www.16personalities.com/articles/assertive-adventurer-isfp-a-vs-turbulent-adventurer-isfp-t
        """
        return random.choises(['INFP-A', 'ISFP-A'], [0.85, 0.15], k=1)[0]
    
    @property
    def hobbies(self):
        """
        What I tend to do in my spare time 
        """
        return [
            ('捣鼓电脑', 0.8),
            ('立直麻将', 0.7),
            ('各种牌类', 0.5),
            ('Steam', 0.5),
            ('羽毛球', 0.1)  # Tend to be lazy...
        ]

    @property
    def IT_skills(self):
        if random.random() < 0.9:
            return [
                "写bug",
                "写💩山"
            ]
        return {
            "backend": [
                {"name": "Python", "desc": "我最常用的编程语言"},
                {"name": "C++", "desc": "正在学习中..."},
                {"name": "Linux", "desc": "我长期使用的操作系统"},
                {"name": "Docker", "desc": "我最常用的虚拟化技术"},
                {"name": "Bash", "desc": "多少会点(x"},
                {"name": "Nginx", "desc": "我最常用的Web服务"},
                {"name": "MySQL", "desc": "会写几条CRUD的水平"},
                {"name": "NodeJS", "desc": "毕竟在用Hexo，总不能不学这个"}
            ],
            "frontend": [
                {"name": "JavaScript", "desc": "马马虎虎吧～"},
                {"name": "CSS", "desc": "说实话我很讨厌写CSS"},
                {"name": "HTML", "desc": "这也能算skill？"},
                {"name": "Vue", "desc": "仅仅用过几次就写进来会不会不太好"},
                {"name": "jQuery", "desc": "复古但好用的JavaScript框架"}
            ],
            "other-tools": [
                {"name": "LaTeX", "desc": "LaTeX大法好，远离Word保平安"},
                {"name": "PyTorch", "desc": "我最常用的深度学习框架"},
                {"name": "Git", "desc": "天天在用但又不敢说自己会的东西"},
                {"name": "Vim", "desc": "我在服务器上的首选文本编辑器"},
                {"name": "VSCode", "desc": "目前在用的开发工具"}
            ]
        }

    @property
    def education_background(self):
        return [
            {
                "school": "慈溪市实验小学",
                "from": "2005",
                "to": "2011",
                "type": None,
                "major": None,
                "degree": None
            },
            {
                "school": "慈溪实验中学",
                "from": "2011",
                "to": "2014",
                "type": None,
                "major": None,
                "degree": None
            },
            {
                "school": "浙江省慈溪中学",
                "from": "2014",
                "to": "2016",
                "type": "理科实验班",
                "major": None,
                "degree": None
            },
            {
                "school": "合肥某技术学校",
                "from": "2016",
                "to": "2020",
                "type": "少院",
                "major": "概率统计",
                "degree": "理学学士"
            },
            {
                "school": "合肥某技术学校",
                "from": "2020",
                "to": "now",
                "type": "大数据学院",
                "major": "数据科学",
                "degree": "在读工学博士研究生"
            }
        ]

    @property
    def research_interests(self):
        return [
            # "数学",
            "深度学习",
            "一切有意思的东西"
        ]

    @property
    def language(self):
        return {
            "zh-cn": {
                "proficiency": "native",
                "desc": "毕竟母语"
            },
            "zh-hant": {
                "proficiency": "almost native",
                "desc": "能够无障碍阅读,但不太能写"
            },
            "en": {
                "proficiency": "intermediate",
                "desc": "Able to read & write basically, but not good at listening & speaking"
            },
            "ja": {
                "proficiency": "basic",
                "desc": "すみません、私は日本語を食べませんね"
            }
        }

```

