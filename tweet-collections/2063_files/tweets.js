$(function () {
    function remove (position) {
        var tweets = Page.tweets.split('.');
        tweets.splice(position, 1);
        var data = {
            accessToken: Session.accessToken,
            tweets: tweets.join('.'),
            creation_date: Page.savedCollectionDate
        };
        $.ajax({
            type: 'PUT',
            url: '/collection/' + Session.twitterName + '/' + Page.savedCollection,
            data: data,
            dataType: 'json',
            success: function (data) {
                if (data.saved) {
                    // Update page state
                    Page.tweets = data.saved.tweets;
                    Page.tweeters = data.saved.tweeters;
                    $('#tweeters').html(data.saved.attifiedTweeters);
                    $('title').text(data.saved.title);
                    
                    var number = position + 1;
                    var tweet = $('#tweet' + number);
                    var tweeterContainer = tweet.parents('li.tweetItem');
                    var slider;
                    var index = $('li.tweetItem').index(tweeterContainer);
                    var length = $('li.tweetItem').size();
                    var children = tweeterContainer.find('.tweet').size();
                    // If it's the first, last or has more than one child, then only remove the tweet
                    if (index === 0 || index === (length - 1) || children > 1) {
                        slider = tweet;
                    } else {
                        slider = tweeterContainer;
                    }
                    slider.slideUp('fast', function () {
                        $(this).remove();
                        $('ul#tweets .tweet').each(function (i) {
                            var number = i + 1;
                            $(this).attr('id', 'tweet' + number);
                            $(this).find('.permalink').text('#' + number).attr('href', '#tweet' + number);
                            $(this).find('.remove').data('tweet-position', i).attr('href', '?' + $.param({
                                remove: i,
                                accessToken: Session.accessToken
                            }));
                        });
                    });
                    if (data.saved.person !== Page.person) {
                        window.location = data.saved.url;
                    }
                }
            },
            failure: function () {
                
            }
        });
    }
    
    var collectLink = $('h1 a.action');
    function collect (save) {
        var action, method, url, data = {};
        if (save) {
            action = 'save';
            method = 'POST';
            url = '/collection';
            data.tweets = Page.tweets;
            if (Page.savedCollection) {
                method = 'PUT';
                url += '/' + Session.twitterName + '/' + Page.savedCollection;
                data.creation_date = Page.savedCollectionDate;
            }
        } else {
            action = 'discard';
            method = 'DELETE';
            url = '/collection/' + Session.twitterName + '/' + Page.savedCollection;
        }
        // Do it
        data.accessToken = Session.accessToken;
        collectLink.addClass('loading');
        $.ajax({
            type: method,
            url: url,
            data: data,
            dataType: 'json',
            success: function (data) {
                collectLink.removeClass('loading');
                switch (action) {
                case 'save':
                    Page.savedCollection = data.saved.id;
                    Page.savedCollectionDate = data.saved.creation_date;
                    collectLink.removeClass('save').addClass('discard').attr('title', 'discard').attr('href', '?' + $.param({
                        discard: 1,
                        accessToken: Session.accessToken
                    }));
                    if (data.saved.person !== Page.person) {
                        window.location = data.saved.url;
                    }
                    break;
                case 'discard':
                    collectLink.removeClass('discard').addClass('save').attr('title', 'collect').attr('href', '?' + $.param({
                        collect: 1,
                        accessToken: Session.accessToken
                    }));
                    if (Page.person === Session.userid) {
                        window.location = data.deleted.url;
                    }
                    break;
                }
            },
            failure: function () {
                collectLink.removeClass('loading');
            }
        });
    }
    
    collectLink.click(function (e) {
        if (Session.isLoggedIn) {
            var action, method, data;
            if (collectLink.hasClass('save')) {
                collect(true);
            } else if (collectLink.hasClass('discard')) {
                collect(false);
            }
            return false;
        }
    });
    
    if (Page.ownedByYou) {
        $('ul#tweets').delegate('a.remove', 'click', function (e) {
            var position = $(e.currentTarget).data('tweet-position') - 0;
            remove(position);
            return false;
        });
    }
    
    $('div.tweet div.wrapper p.text a').not('a.mention, a.hashtag, a.photo').embedly({
        maxWidth: 560,
        method: 'afterParent',
        key: ET.EmbedlyApiKey
    });
});
