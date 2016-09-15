window.dataService =
(function(){
    var self = this;

    var data = {
        stories: [
                    {
                            key: 0,
                            author: 'Brandon Mayhew',
                            title: 'Video Games Prepared Me For Fatherhood',
                            hash: 'Brandon MayhewVideo Games Prepared Me For Fatherhood'
                        },
                        {
                            key: 1,
                            author: 'Rose Fairhaven',
                            title: 'IL Governor Is Abandoning His Citizens On The Budget',
                            hash: 'Rose FairhavenIL Governor Is Abandoning His Citizens On The Budget'
                        },
                        {
                            key: 2,
                            author: 'Frank Zappa',
                            title: 'Without Deviation From The Norm, Progress Is Not Possible',
                            hash: 'Frank ZappaWithout Deviation From The Norm, Progress Is Not Possible'
                        },
                        {
                            key: 3,
                            author: 'Carl Lord',
                            title: 'Can I Google On This Thing? Post-Modern IoT Reflections',
                            hash: 'Carl LordCan I Google On This Thing? Post-Modern IoT Reflections'
                        },
                        {
                            key: 4,
                            author: 'Trinity Shosin',
                            title: 'Want Happiness? Head West',
                            hash: 'Trinity ShosinWant Happiness? Head West'
                        },
                        {
                            key: 5,
                            author: 'Hugh Mungus',
                            title: 'Modern Problems Need Modern Solutions',
                            hash: 'Hugh MungusModern Problems Need Modern Solutions'
                        },
                        {
                            key: 6,
                            author: 'Mark Potter',
                            title: '2016 Sees First Year In A Decade That More Students Pursue Work Than College',
                            hash: 'Mark Potter2016 Sees First Year In A Decade That More Students Pursue Work Than College'
                        },
                        {
                            key: 7,
                            author: 'Tamia Rowdlin',
                            title: 'Dune: King Among Kings In The Sci-Fi World',
                            hash: 'Tamia RowdlinDune: King Among Kings In The Sci-Fi World'
                        },
                        {
                            key: 8,
                            author: 'Selfab Sorbed',
                            title: "Everyone Who Disagrees With Me Is A Sheep",
                            hash: "Selfab SorbedEveryone Who isn't Me Is A Sheep"
                        }
                ]
    };  

    var add = function(payload){
        var store = data[payload.store];

        var exists = store.filter(function(item){
            return item.hash.toString().toLowerCase() === payload.body.hash.toString().toLowerCase();
        });

        if (exists.length > 1) return makeError(400, "An object with that id already exists");

        else{
            var tmp = store.slice();
            var len = tmp.length;
            payload.body.key = len;
            tmp.push(payload.body);
            data[payload.store] = tmp;

            return makeResponse(copy(payload.body));
        }
    };

    var copy = function(ob){
        var retVal = {};
        for (var attr in ob){
            if (ob.hasOwnProperty(attr)) retVal[attr] = ob[attr];
        }

        return copy;
    };

    var count = function(payload){
        if (data.hasOwnProperty(payload.store)){
            return data[payload.store].length;
        }

        return makeError(404, null);
    };

    var get = function(payload){
        return payload.action == "count" ? count(payload.body) : select(payload.body);
    };

    var http = function(request){
        var retVal = null;
        switch(request.method.toUpperCase()){
            case 'DELETE':
                retVal = remove(request.payload);
                break;

            case 'GET': 
                retVal = get(request.payload);
                break;

            case 'POST':
                retVal = add(request.payload);
                break;

            case 'PUT':
                retVal = modify(request.payload);
                break;
        }

        var randomWait = waitTimes[Math.floor(Math.random() * waitTimes.length)];

        var now = new Date().getTime();
        
        var doneWaiting = false;

        while (!doneWaiting){
            doneWaiting = (new Date().getTime() < (now + randomWait));
        }

        return retVal;
    };

    var indexSelect = function(payload) {
        if (Object.hasOwnProperty(payload.store)){
            var store = self.data[payload.store];
            var len = store.length;

            if (payload.id < len){
                return makeResponse(store[payload.id]);
            }
        }

        return makeError(404, null);
    };

    var makeError = function(code, msg){
        return {
            code: code,
            msg: msg
        }
    };

    var makeResponse = function(payload){
        return {
            code: 200,
            payload: payload
        }
    };

    var randomSelect = function(payload){
        var possible = data[payload.store].filter(function(item){
            return payload.excluded.indexOf(item.key) < 0;
        });

        return possible.length > 0 ? makeResponse(possible[Math.floor(Math.random() * possible.length)]) : makeError(404, null);
    };

    var remove = function(payload){
        var store = data[payload.store];
        if (store.filter(function(item){ return item.key === payload.body.key;}).length > 1){
            var tmp = store.filter(function(item){
                return item.key !== payload.body.key;
            });
            data[payload.store] = tmp;

            return makeResponse(true);
        }
        
        else return makeError(404, null);
    };

    var select = function(payload){
        return payload.random ? randomSelect(payload) : indexSelect(payload);
    };

    var waitTimes = [50, 100, 150, 200];

    self.addStory = function(story){
        return http({
            method: 'POST',
            payload: {
                store: 'stories',
                body: story
            }
        });
    };

    self.countStories = function(){
        return http({
            method: 'GET',
            payload: {
                action: "count",
                body: {
                    store: 'stories'
                }                
            }
        });
    }

    self.deleteStory = function(id){
        return http({
            method: 'DELETE',
            payload: {
                store: 'stories',
                body: id
            }
        });
    };
    
    self.getNewStory = function(keys){
        return http({
            method: 'GET',
            payload: {
                action: "select",
                body:{
                    random: true,
                    store: 'stories',
                    excluded: keys
                }                
            }
        });
    };    

    self.modifyStory = function(story){
        return http({
            method: 'PUT',
            payload: {
                store: 'stories',
                body: story
            }
        })
    };

    return self;
})();