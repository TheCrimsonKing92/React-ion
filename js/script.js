var service = window.dataService;
//mixin
var DisposingIntervalMixin = {
    componentWillMount: function(){
        this.interval = null;
    },

    setInterval: function() {
        this.interval = setInterval.apply(null, arguments);
    },

    componentWillUnmount: function() {
        clearInterval(this.interval);
    }
}
//Feed-style "story" holder, updates frequently to add "new" stories
var StoryPane = React.createClass({
    mixins: [DisposingIntervalMixin],

    componentDidMount: function() {
        this.refresh();
        this.setInterval(this.refresh, this.props.refreshTime);
    },

    checkServiceResponse: function(response){
        if (response.code === 200){
            if (response.payload != null){
                console.log("Service payload: " + JSON.stringify(response.payload));
                var tempState = this.state.stories.slice();
                tempState.push(response.payload);

                this.setState({stories: tempState});
            }
        }

        else{
            console.log("Non-200 response");
            console.log("Code: " + response.code);
            console.log("Message: " + response.msg);
        }
    },    
    
    getInitialState: function() {
        return {closed: [], stories: []};
    },
    
    refresh: function() {
        var currLen = this.state.stories.length;
        var maxLen = service.countStories();        
        
        if (currLen < maxLen){
            console.log("Missing " + (maxLen - currLen) + " stories from data service");
            var contained = this.state.stories.map(function(story){ return story.key;});
            console.log("Contained keys: " + JSON.stringify(contained));

            this.checkServiceResponse(service.getNewStory(contained));
        }
    },
    
    render: function() {
        console.log("Storypane props: " + JSON.stringify(this.props));
        return (
          <div className="storyPane nudge-down">
            <h1 className="nudge-down">Welcome to the Story Feed</h1>
            <h4 className="nudge-down">This page simulates dynamic data retrieval, storage, and rendering through ReactJS</h4>
            <h4 className="nudge-down">You may use the X to hide stories from view at any time</h4>
            <StoryList data={this.state.stories} refreshTime={this.props.refreshTime} />
            <SubmitBox handleSubmitCallback={this.submitStory} />
            <TimeStamp refreshTime="1000" />
          </div>  
        );
    },

    submitStory: function(story){
        service.addStory(story);
    }  
});

var StoryList = React.createClass({
    excludeStory: function(key){
        var tmp = this.state.excluded;

        if (tmp.indexOf(key) < 0){
            tmp.push(key);
            this.setState({excluded: tmp});
        }
    },

    filterExcluded: function(story){
        return this.state.excluded.indexOf(story.key) < 0;
    },

    getInitialState: function() {
        return {excluded: [], stories: []};
    },

    mapStory: function(story){
        return(
                <Story id={story.key} author={story.author} title={story.title} onCloseCallback={this.excludeStory} />
            );
    },
    
    render: function() {
        var stories = this.props.data.filter(this.filterExcluded).map(this.mapStory);
        return (
          <div className="nudge-down-2x row">
            <div className="col-xs-12">
                {stories}
            </div>
          </div>  
        );
    }  
});

var Story = React.createClass({ 
    close: function(){
        this.props.onCloseCallback(this.props.id);
    },   
    render: function() {
        return (
          <div className="story shadow">
            <div className="col-xs-11">
                <h4 className="storyAuthor">
                Author: {this.props.author}
            </h4>
            </div>
            <div className="col-xs-1">
                <span onClick={this.close}>X</span>
            </div>
            <div className="col-xs-11">
                <h4 className="storyTitle">
                    Title: {this.props.title}
                </h4>
            </div>            
          </div>  
        );
    }  
});

var SubmitBox = React.createClass({
    createStory: function(author, title){
        var hash = author + title;

        return {
            author: author,
            title: title,
            hash: hash
        };
    },
    getInitialState: function() {
        return {author: '', title: ''};
    },

    handleAuthorChange: function(e){
        this.setState({author: e.target.value});
    },

    handleSubmit: function(e){
        e.preventDefault();
        var author = this.state.author.trim();
        var title = this.state.title.trim();

        if (!author || !title) return;

        this.props.handleSubmitCallback(this.createStory(author, title));

        this.setState({author: '', title: ''});
    },

    handleTitleChange: function(e){
        this.setState({title: e.target.value});
    },

    render: function(){
        return (
            <div class="row nudge-down">
                <div className="col-xs-12">
                    <h3>Use the form below to add new stories</h3>
                </div>
                <div className="col-xs-12">
                    <label>Author</label>
                    <input type="text" className="form-control" value={this.state.author} onChange={this.handleAuthorChange}/>
                </div>
                <div className="col-xs-12">
                    <label>Title</label>
                    <input type="text" className="form-control" value={this.state.title} onChange={this.handleTitleChange}/>
                </div>
                <div className="col-xs-2 nudge-down">
                    <button type="button" className="button" onClick={this.handleSubmit}>Submit</button> 
                </div>
            </div>            
        );
    }
});

var TimeStamp = React.createClass({
    mixins: [DisposingIntervalMixin],

    getInitialState: function() {
        return {
            time: new Date()
        }
    },   
    
    componentDidMount: function() {
        this.setInterval(this.refresh, this.props.refreshTime);
    },
    
    refresh: function() {
        this.setState({
            time: new Date()
        });
    },
    
    render: function() {
        var stamp = "Current time: " + this.state.time;
        return (
            <div className="col-xs-12">
                <p className="timeStamp">
                    {stamp}
                </p>
            </div>            
        );
    }  
});

var Banner = React.createClass({
    render: function() {
        return (
          <div className="col-xs-12 banner"></div>  
        );
    }  
});

var Container = React.createClass({
    render: function() {
        return (
            <div class="main">
                <Banner />
                <div className="container-fluid container-constraint">
                    <StoryPane refreshTime="1500"/>
                </div>
            </div>
        );
    }  
});

//TODO: Banner, StoryList, Story, Timestamp components
//CSS classes

ReactDOM.render(<Container />, document.getElementsByTagName('body')[0]);