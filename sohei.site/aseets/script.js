'use strict';

//topへ戻る
window.onscroll = function () {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        document.getElementById("back-to-top").style.display = "block";
    } else {
        document.getElementById("back-to-top").style.display = "none";
    }
};





//パララックス
class ParallaxEffectBackground {
    constructor() {
        this.devided = 5;
        this.target = '.background';
        this.setBackgroundPosition();
    }

    getScrollTop() {
        return Math.max(
            window.pageYOffset,
            document.documentElement.scrollTop,
            document.body.scrollTop,
            window.scrollY
        );
    }

    setBackgroundPosition() {
        document.addEventListener('scroll', e => {
            const scrollTop = this.getScrollTop();
            const position = scrollTop / this.devided;
            if (position) {
                document.querySelectorAll(this.target).forEach(element => {
                    element.style.backgroundPosition = 'center top -' + position + 'px';
                });
            }
        });
    }
}
document.addEventListener('DOMContentLoaded', event => {
    new ParallaxEffectBackground();
});


//GSAP ふわっと出てくるスクロールアニメーション
gsap.fromTo(
    ".scroll", // アニメーションさせる要素
    {
        autoAlpha: 0, // アニメーション開始前は透明
    },
    {
        autoAlpha: 1, // アニメーション後に出現(透過率0)
        scrollTrigger: {
            trigger: ".scroll", // アニメーションが始まるトリガーとなる要素
            start: "top center", // アニメーションの開始位置
        },
    }
);

gsap.fromTo(
    ".scroll2", // アニメーションさせる要素
    {
        autoAlpha: 0, // アニメーション開始前は透明
    },
    {
        autoAlpha: 1, // アニメーション後に出現(透過率0)
        scrollTrigger: {
            trigger: ".scroll2", // アニメーションが始まるトリガーとなる要素
            start: "top center", // アニメーションの開始位置
        },
    }
);

gsap.fromTo(
    ".scroll3", // アニメーションさせる要素
    {
        autoAlpha: 0, // アニメーション開始前は透明
    },
    {
        autoAlpha: 1, // アニメーション後に出現(透過率0)
        scrollTrigger: {
            trigger: ".scroll3", // アニメーションが始まるトリガーとなる要素
            start: "top center", // アニメーションの開始位置
        },
    }
);

gsap.fromTo(
    ".scroll4", // アニメーションさせる要素
    {
        autoAlpha: 0, // アニメーション開始前は透明
    },
    {
        autoAlpha: 1, // アニメーション後に出現(透過率0)
        scrollTrigger: {
            trigger: ".scroll4", // アニメーションが始まるトリガーとなる要素
            start: "top center", // アニメーションの開始位置
        },
    }
);

gsap.fromTo(
    ".scroll5", // アニメーションさせる要素
    {
        autoAlpha: 0, // アニメーション開始前は透明
    },
    {
        autoAlpha: 1, // アニメーション後に出現(透過率0)
        scrollTrigger: {
            trigger: ".scroll5", // アニメーションが始まるトリガーとなる要素
            start: "top center", // アニメーションの開始位置
        },
    }
);


//ふわっと出てくるアニメーション
gsap.fromTo('.gsap', {
    opacity: 0,
},
    {
        opacity: 1,
        duration: 1,
        delay: .8
    }
);