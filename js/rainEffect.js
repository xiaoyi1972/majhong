class Rain {
    constructor() {
        this.rainFront = null;
        this.rainBack = null;
    }

    init() {
        this.rainFront = document.createElement('div');
        this.rainBack = document.createElement('div');
        this.rainFront.classList.add('rain')
        this.rainFront.classList.add('front-row')
        this.rainBack.classList.add('rain')
        this.rainBack.classList.add('back-row')
        let contain=document.querySelector('.contain')
        contain.append(this.rainFront);
        contain.append(this.rainBack);
        this.raining = false;
    }

    start() {
        this.init();
        this.makeItRain();
        this.raining = true;
    }

    stop() {
        document.querySelectorAll('.rain').forEach(item => {
            item.innerHTML = "";
            item.parentNode.removeChild(item);
        })
        this.rainFront = null;
        this.rainBack = null;
        this.raining = false;
    }

    makeItRain() {
        //clear out everything
        document.querySelectorAll('.rain').forEach(item => { item.innerHTML = ""; })

        let increment = 0;
        let drops = "";
        let backDrops = "";

        while (increment < 100) {
            //couple random numbers to use for letious randomizations
            //random number between 98 and 1
            let randoHundo = (Math.floor(Math.random() * (98 - 1 + 1) + 1));
            //random number between 5 and 2
            let randoFiver = (Math.floor(Math.random() * (5 - 2 + 1) + 2));
            //increment
            increment += randoFiver;
            //add in a new raindrop with letious randomizations to certain CSS properties
            drops += `<div 
        class="drop" style="right:${increment}%; 
        transform: translateY( ${0 - (randoFiver + randoFiver - 1)}vh);
       /* bottom: ${(randoFiver + randoFiver - 1 + 100)}%; */
        animation-delay: 0.${randoHundo}s; 
        animation-duration: 0.5${randoHundo}s;">
        <div class="stem" style="animation-delay: 0.${randoHundo}s; 
        animation-duration: 0.5${randoHundo}s;"></div>
        <div class="splat" style="animation-delay: 0.${randoHundo}s; 
        animation-duration: 0.5${randoHundo}s;"></div>
        </div>`;
            backDrops += `<div 
        class="drop" style="right: ${increment}%; 
        transform: translateY( ${0 - (randoFiver + randoFiver - 1)}vh);
       /* bottom: ${(randoFiver + randoFiver - 1 + 100)}%; */
        animation-delay: 0.${randoHundo}s;
        animation-duration: 0.5${randoHundo}s;">
        <div class="stem" style="animation-delay: 0.${randoHundo}s; 
        animation-duration: 0.5${randoHundo}s;"></div>
        <div class="splat" style="animation-delay: 0.${randoHundo}s; 
        animation-duration: 0.5${randoHundo}s;"></div>
        </div>`;
        }

        document.querySelector('.rain.front-row').innerHTML = drops;
        //   document.querySelector('.rain.back-row').innerHTML = backDrops;
    }
}