Avatars.cached = {};
Avatars.fetching = {};
Avatars.munchQueue = function () {
    var image;
    for (var personUrl in Avatars.errors) {
        image = Avatars.errors[personUrl].pop();
        if (!image) {
            // Nothing more to munch
            break;
        }
        Avatars.onError.call(image, personUrl);
    }
};
Avatars.setImage = function (image, personUrl) {
    // Update image source and mark as done
    $(image).attr('src', Avatars.cached[personUrl]).data('avatar.fixed', true);
    Avatars.munchQueue();
};
Avatars.onError = function (personUrl) {
    var image = this;
    if ($(image).data('avatar.fixed')) {
        // Already done
        return;
    }
    if (Avatars.cached[personUrl]) {
        // Cached
        Avatars.setImage(image, personUrl);
        return;
    }
    if (Avatars.fetching[personUrl]) {
        // Already fetching, enqueue
        Avatars.queueError.call(image, personUrl);
        return;
    }
    // Fetch the new avatar from Twitter
    Avatars.fetching[personUrl] = true;
    $.ajax({
        url: personUrl,
        type: 'post',
        dataType: 'json',
        success: function success (data, textStatus) {
            if (!data.error && data.avatar) {
                // Fetched hurrah!
                Avatars.cached[personUrl] = data.avatar;
                Avatars.fetching[personUrl] = false;
                Avatars.setImage(image, personUrl);
            }
        }
    });
};
Avatars.munchQueue();

ET.getSearchParts = function (part) {
    var urlParts = window.location.search.replace(/^\??/, '').split('&');
    var parts = {};
    $.each(urlParts, function (i, part) {
        var kv = (part.split('='));
        parts[kv[0]] = kv[1];
    });
    if (typeof part !== 'undefined') {
        return parts[part];
    } else {
        return parts;
    }
};
