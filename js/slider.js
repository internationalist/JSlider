class Slider {
	
	constructor(id, visible) {
		this.start = null;
		this.index = 0;
		this.setupData;
		this.resizeTimer;
		this.mouseDrag=false;
		this.mouseXStart;
		this.dragged=false;
		this.id=id;
		this.visible=visible;
		this.initialize();
		this.setupEventHandling();
	}
	
	initialize() {
		this.setupData = this.derivePanelSize();
		let panel = $('#' + this.id + ' .sliderframe .panel'); 
		panel.css('width', this.setupData.panelWidth);
		let sliderH = Math.ceil(this.getCSSProperty(document.querySelector('#' + this.id + ' .sliderframe .panel'), 'height'));
		$('#' + this.id).css('height', sliderH);

		let slider =  $('#' + this.id + ' .sliderframe');
		this.setupData['slider']=slider;		

		let cWidth = this.calculateContainers();
		slider.css('width', cWidth);
		if(this.index < this.setupData.minIndex) {
			this.index = this.setupData.minIndex;
		}
		slider.css('left', this.index*(this.setupData.panelWidth + this.setupData.margin))
		return this.setupData;	
	}
	
	resize(event) {
		if(!this.resizeTimer) {
			this.resizeTimer = setTimeout(()=>{
				this.resizeTimer = null;
				this.setupData = this.initialize();
	  		}, 300);			
		}
	}
	
	setupEventHandling() {
		$('#' + this.id + '_left').on('click', ()=>{
			this.slideRightByPanel();			
		});		
	
		$('#' + this.id + '_right').on('click', ()=>{
			this.slideLeftByPanel();
		});
		
		let slide = document.querySelector('#' + this.id);
		slide.addEventListener('mousedown', (event)=>{
			event.preventDefault()
			this.mousedrag = true;
			this.mouseXStart = event.clientX;
				
		}, false);
		slide.addEventListener('mousemove', (evt)=>{
			if(this.mousedrag) {
				this.dragged = true;
				this.slideOnDrag((evt.clientX - this.mouseXStart)/10);
			}
		}, false);
		slide.addEventListener('mouseup', ()=>{
			if(this.dragged) {
				$('#' + this.id + ' .sliderframe').animate({left:this.index*(this.setupData.panelWidth + this.setupData.margin)}, 500);
				this.dragged = false;
			}
			this.mousedrag = false;}, false);
	}
	
	calculateContainers() {
		let containerWidth = this.setupData.panelWidth*this.setupData.size
			+ (this.setupData.size + 1)*this.setupData.margin + 2*this.setupData.size*this.setupData.borderWidth;
		return containerWidth
	}
	
	slideLeftByPanel() {
		let moveBy = this.setupData.panelWidth + this.setupData.margin - this.getSlideOffset();
		let currentLeft = this.getCSSProperty(document.querySelector('#' + this.id + ' .sliderframe'), 'left');		
		if(currentLeft > this.setupData.minLeft) {
			let moveTo = currentLeft - moveBy;
			if(moveTo < this.setupData.minLeft) {
				moveTo = this.setupData.minLeft;
			}
			this.index = Math.round(moveTo/this.setupData.panelWidth);
			this.setupData.slider.animate({left:moveTo}, 1000);
		}
	}
	
	slideRightByPanel() {
		let moveBy = this.setupData.panelWidth + this.setupData.margin - this.getSlideOffset();
		let currentLeft = this.getCSSProperty(document.querySelector('#' + this.id + ' .sliderframe'), 'left');
		if(currentLeft < this.setupData.maxLeft) {
			let moveTo = currentLeft + moveBy;
			if(moveTo > this.setupData.maxLeft) {
				moveTo = this.setupData.maxLeft;
			}
			this.index = Math.round(moveTo/this.setupData.panelWidth);
			this.setupData.slider.animate({left:moveTo}, 1000);
		}
	}
	getSlideOffset() {
		let currentPos = this.getCSSProperty(document.querySelector('#' + this.id + ' .sliderframe'), 'left');
		let panelSize = this.setupData.panelWidth + this.setupData.margin;
		return Math.abs(currentPos%panelSize);
	}
	
	slideOnDrag(slideAmt) {
		let currentLeft = this.getCSSProperty(document.querySelector('#' + this.id + ' .sliderframe'), 'left');
		currentLeft += slideAmt;
		let running = false;

		if(!running && currentLeft < this.setupData.maxLeft && currentLeft >= this.setupData.minLeft) {
			running = true;
			window.requestAnimationFrame(()=>{
				this.setupData.slider.css('left', currentLeft);
				this.index = Math.round(currentLeft/this.setupData.panelWidth);
				running = false;});
		}
	}
	
	parseSize(dim) {
		dim = new String(dim);
		let dimNum = dim.substring(0,dim.indexOf("px"));
		return Number(dimNum);
	}
	
	getCSSProperty(elem, p) {
		let elemStyle = window.getComputedStyle(elem);
		let cssProp = elemStyle.getPropertyValue(p);
		if(cssProp.indexOf("px") >= 0) {
			return this.parseSize(cssProp);
		} else {
			return cssProp;
		}
	}
	
	setup() {
		//get the top container and get all its attributes.
		let panel = document.querySelector('#' + this.id + ' .sliderframe .panel');
		let panelStyle = window.getComputedStyle(panel);
		//count the number of panels.
		let container = document.querySelector('#' + this.id + ' .sliderframe');

		let panels = container.childNodes;
		let size = 0;
		for(let  i = 0; i < panels.length; i++) {
			if(panels[i].nodeType==1) {
				++size;		
			}
		}
		let borderWidth = this.getCSSProperty(panel, 'border-width');
		let margin = this.getCSSProperty(panel, 'margin-left');
		
		return {"size":size, "borderWidth":borderWidth,
			"margin":margin}
	}
	
	derivePanelSize() {
		let setupData = this.setup();
		let panelMinSize = 80;
		let maxVisible = 5;
		let minVisible = 1;
		let border = setupData.borderWidth;
		let margin = setupData.margin;
		let visible = maxVisible;
		//get the current width of the visible div.
		let vContainerW = Math.floor(this.getCSSProperty(document.querySelector('#' + this.id), 'width'));
		//based upon the visible width, calculate the panel size w.r.t minimum panel size and max visible
		let done = false;
		let pw = 0;
		while(!done && visible > 0) {
				pw = (vContainerW - (visible + 1)*margin)/visible;
				if(pw >= panelMinSize + border*2) {
					done = true;
				} else {
					--visible;
				}
		}
		if(visible == 0) {
			visible = minVisible;
		}

		setupData['panelWidth'] = Math.floor(pw);
		setupData['visible'] = visible;
		setupData['maxLeft'] = 0;
		setupData['minLeft'] = -1*(setupData.panelWidth + setupData.margin)*(setupData.size - setupData.visible);
		setupData['minIndex'] = setupData.minLeft/(setupData.panelWidth + setupData.margin);
		return setupData;
	}	
}