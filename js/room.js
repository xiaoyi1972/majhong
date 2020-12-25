class Room {
    constructor(_contain) {
        this.init();
        this.contain = _contain;
    }
    get electIndex() {
        return this.elects.indexOf(this.elect);
    }

    init() {
        this.elects = [];
        this.elect = null;
        this.electsInfo = new Map();
    }

    create(_info = null) {
        let SelectDiv = document.createElement('div');
        this.contain.append(SelectDiv);
        this.elects.push(SelectDiv);
        let info = _info == null ? { name: '测试', playerAmount: 0 } : _info;
        this.electsInfo.set(SelectDiv, info)
        SelectDiv.classList.add('roomSelect');
        SelectDiv.innerHTML = `房间${this.elects.length}
        <br> 
        名称 <span style="color:blue">${info.name}</span>
        人数 <span style="color:blue">${info.playerAmount}</span>/4`
        SelectDiv.addEventListener('click', () => {
            this.selectClick(SelectDiv);
        })
    }

    selectTo(_id) {
        if (_id == -1) return;
        console.log('_id',_id)
        this.elects.forEach(item => {
            if (item.classList.contains('Selected'))
                item.classList.remove('Selected');
        })
        this.elects[_id].classList.toggle('Selected');
        this.elect = this.elects[_id];
    }

    selectClick(_select) {
        this.elects.forEach(item => {
            if (item.classList.contains('Selected'))
                item.classList.remove('Selected');
        })
        _select.classList.toggle('Selected');
        this.elect = _select;
        let index = this.electIndex;
        getRoomUsers(index);
    }

    empty() {
        this.contain.innerHTML = "";
        this.init();
    }
}