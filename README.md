# Recommend

## Dependancies:
- request.js  (npm install request) (used for testing)
- elasticsearch.js (npm install elasticsearch)
- restify.js (npm install elasticsearch)

## How it works

- User1 (likes,views etc) a,b,c,d
- User2 likes x,y,z
- User3 likes a,b,e,f,g
- User4 likes a,b,c,g,h,i,j

We find matches for user 1  -> User3, User4, and add up the scores of the search results for the items that User1 doesn't have. (e,f,g and g,h,i,j)

In the /test directory: 
- add_recommendation.js is an example of adding likes for a couple of users. Obviously this would happen individually.
-  get_recommendation.js returns some recommendations for user1
-  get_recommendation_items.js returns recommendations for a list of items.
-  get_user.js is an example of getting the list of items user1 has liked.

The engine currently supports the following:
- add an item/list of items for a given user (for an action within a domain eg. like/view etc.)
		```/[domain]/[listname]/[userid]```
- get recommendations for a list ot items (for an action within a domain eg. like/view etc.)
		```/recommendation/[domain]/[listname]?list=[itemid],[itemid]  //think itemid = sku ```
- get recommendations for a given user (for an action within a domain eg. like/view etc.)
		```/recommendation/[domain]/[listname]/[userid]```
- get a list of items for a given user (for an action within a domain eg. like/view etc.)
		```/[domain]/[listname]/[userid]```
	
##Comments
* I've kept it relatively generic so it could be run for multiple domains, and multiple actions: likes, views, follows, whatever.
* The main piece of work is lib/recommendation.js

##Todo
- add a method to remove an item from a user's list
-  add a method to aggregate multiple lists with various weightings eg. buy(10),like(5),view(1)




