Template.posts_list.helpers({
  posts : function () {
    this.postsList.rewind();
    var posts = this.postsList.map(function (post, index, cursor) {
      post.rank = index;
      return post;
    });
    posts = posts.slice(parseInt(Session.get('postsLimit')) - 10, parseInt(Session.get('postsLimit')));

    return posts;
  },
  hasMorePosts: function(){
    // as long as we ask for N posts and all N posts showed up, then keep showing the "load more" button
    return parseInt(Session.get('postsLimit')) == this.postsCount
  },
  loadMoreUrl: function () {
    var count = parseInt(Session.get('postsLimit')) + parseInt(getSetting('postsPerPage', 10));
    var categorySegment = Session.get('categorySlug') ? Session.get('categorySlug') + '/' : '';
    return '/' + Session.get('view') + '/' + categorySegment + count;
  },
  hasPrevPosts: function () {
    return parseInt(Session.get('postsLimit')) > 10 && this.postsCount > 10;
  },
  loadPrevUrl: function () {
    var count = parseInt(Session.get('postsLimit')) - parseInt(getSetting('postsPerPage', 10));
    var categorySegment = Session.get('categorySlug') ? Session.get('categorySlug') + '/' : '';
    return '/' + Session.get('view') + '/' + categorySegment + count;
  }
});

Template.posts_list.created = function(){
   Template.posts_list.createdLeaflet = false;
}

Template.posts_list.destroyed = function(){
   Template.posts_list.createdLeaflet = false;
}

Template.posts_list.rendered = function(){
  var distanceFromTop = 0;
  $('.post').each(function(){
    distanceFromTop += $(this).height();
  });
  Session.set('distanceFromTop', distanceFromTop);
  $('body').css('min-height',distanceFromTop+160);

  if(!Template.posts_list.createdLeaflet){
      L.Icon.Default.imagePath = '/packages/leaflet/images';

      leafletMap = L.map('map').setView([37.76, -122.45], 11);

     L.tileLayer('http://{s}.tile.cloudmade.com/9be3de5cb3a34fd7acb76b6872f784df/997/256/{z}/{x}/{y}.png', {
		   maxZoom: 18,
		   attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>'
	   }).addTo(leafletMap);
      Template.posts_list.createdLeaflet = true;
  }

  $.each(Template.posts_list.mapMarkers, function(index, mkr){
    mkr.addTo(leafletMap);
  });

  if(Session.get('selectedMkr')){
    if(typeof Template.posts_list.mapPopups[Session.get('selectedMkr')] !== 'undefined')
      Template.posts_list.mapPopups[Session.get('selectedMkr')].openOn(leafletMap);
    $('.post-content').css('background-color', '#fff');
    $('#'+Session.get('selectedMkr')+' .post-content').css('background-color', '#ffc');
  }
	
  leafletMap.on('moveend', (function(e){
    Session.set("locLatMin", leafletMap.getBounds().getSouthWest().lat);
    Session.set("locLatMax", leafletMap.getBounds().getNorthEast().lat);
    Session.set("locLongMin", leafletMap.getBounds().getSouthWest().lng);
    Session.set("locLongMax", leafletMap.getBounds().getNorthEast().lng);
  }), this);
}

