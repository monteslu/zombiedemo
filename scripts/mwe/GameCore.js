dojo.provide('mwe.GameCore');


dojo.require('mwe.InputManager');

/*********************** mwe.GameCore ********************************************/
dojo.declare("mwe.GameCore",null,{


	


	statics: {FONT_SIZE : 24},
    isRunning : false,
   
    canvasId: null,
    maxStep: 40,  //max number of milliseconds between updates. (in case user switches tabs and requestAnimationFrame pauses)
    contextType: '2d',
    height: 480,
    width: 640,
    resourceManager: null,
    inputManager: null,
    loadingForeground: '#00F',
    loadingBackground: '#FFF',
    
    constructor: function(args){
		dojo.safeMixin(this, args);	
		// canvas: null,	
	},


    /**
        Signals the game loop that it's time to quit
    */
    stop: function() {
        isRunning = false;
    },


    /**
        Calls init() and gameLoop()
    */
    run: function() {
       this.init();
       this.loadResources(this.canvas);
       this.launchLoop();
       
       
    },

    /**
    Should be overidden in the subclasses to create images
	*/
	loadResources: function(canvas){

    },

    /**
        Sets full screen mode and initiates and objects.
    */
    init: function() {
        if(!this.canvas){
    		this.canvas = dojo.byId(this.canvasId);
        }
    	if(!this.canvas){
			alert('Sorry, your browser does not support canvas.  I recommend any browser but Internet Explorer');
			return;
    	}
    	
    	if(!this.context){
    		this.context = this.canvas.getContext(this.contextType);    		
    	}
    	if(!this.canvas){
			alert('Sorry, your browser does not support a ' + this.contextType + ' drawing surface on canvas.  I recommend any browser but Internet Explorer');
			return;
    	}
    	this.canvas.height =  this.height;
    	this.canvas.width = this.width;
    	
    	if(!this.inputManager){
    		this.inputManager = new mwe.InputManager({canvas: this.canvas});
    	}
    
    	this.initInput(this.inputManager);
    	
        this.isRunning = true;
    },
    
    
    /**
    Should be overidden in the subclasses to map input to actions
	*/
    initInput: function(inputManager) {
        
    },


    /**
    Runs through the game loop until stop() is called.
	*/
	gameLoop: function() {
    		this.currTime = new Date().getTime();
    		this.elapsedTime = Math.min(this.currTime - this.prevTime, this.maxStep);            
            this.prevTime = this.currTime;
    	
	    	if(this.resourceManager && this.resourceManager.resourcesReady()){  
	        
	           //console.log("time elapsed, since last update:" + this.elapsedTime);
				if(!this.paused){
					// update
					this.update(this.elapsedTime);
				}
				
				// draw the screen
				this.context.save();
	            this.draw(this.context);
	            this.context.restore();
				
	    	}else{
	    		this.updateLoadingScreen(this.elapsedTime);
	    		this.drawLoadingScreen(this.context);
	    	}
	
	},
	
	/**
	 Launches the game loop.
	 */
	launchLoop: function(){
	
		this.elapsedTime = 0;
		var startTime = Date.now();
	    this.currTime = startTime;
	    this.prevTime = startTime;
		
		
		
		// shim layer with setTimeout fallback
		window.requestAnimFrame = (function(){
		  return  window.requestAnimationFrame       || 
				  window.webkitRequestAnimationFrame || 
				  window.mozRequestAnimationFrame    || 
				  window.oRequestAnimationFrame      || 
				  window.msRequestAnimationFrame     || 
				  function(/* function */ callback, /* DOMElement */ element){
					window.setTimeout(callback, 1000 / 60);
				  };
		})();
		
		
		// usage: 
		// instead of setInterval(render, 16) ....
	    var thisgame = this;
	    
		(function animloop(){
		  thisgame.gameLoop();
		  requestAnimFrame(animloop, thisgame.canvas);
		})();
		
	},


    /**
        Updates the state of the game/animation based on the
        amount of elapsed time that has passed.
    */
     update: function(elapsedTime) {
        //overide this function in your game instance
    },


    /**
	    Override this if want to use it update sprites/objects on loading screen
	*/
	 updateLoadingScreen: function(elapsedTime) {
	},
    
    /**
        Draws to the screen. Subclasses or instances must override this
        method to paint items to the screen.
    */
    draw: function(context){
    	if(this.contextType == '2d'){
    		context.font = "14px sans-serif";
    		context.fillText("This game does not have its own draw function!", 10, 50);
    	}
    },
    
    drawLoadingScreen: function(context){
    	
    	if(this.resourceManager && (this.contextType == '2d')){
    		context.fillStyle   = this.loadingBackground;
    		context.fillRect(0,0, this.width,this.height);
    		
    		context.fillStyle   = this.loadingForeground;
    		context.strokeStyle = this.loadingForeground; 
    		
    		var textPxSize =  Math.floor(this.height/12);
    		//var loadingText = ;
    		//var textWidth = ctx.measureText(s.text).width;
    		
    		context.font = "bold " + textPxSize + "px sans-serif";
    		
    		//console.log('% complete ' + this.resourceManager.getPercentComplete());
    		context.fillText("Loading... " + this.resourceManager.getPercentComplete() + "%", this.width * 0.1, this.height * 0.55);
    		
    		context.strokeRect(this.width * 0.1, this.height * 0.7,this.width * 0.8, this.height * 0.1);
    		context.fillRect(this.width * 0.1, this.height * 0.7,(this.width * 0.8) * this.resourceManager.getPercentComplete()/100, this.height * 0.1);
    		
    		
    		context.lineWidth   = 4;
    	}
    	
    }
});