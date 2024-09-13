function lazyPic(emt, animeTime, thumbnailType, thumbnailLevel) {
    this.emt = emt;
    this.animeTime = animeTime;
    this.thumbnailType = thumbnailType;

    this.lazyLoad = function () {
        const $finalImages = $(this.emt);
        const observer = new IntersectionObserver(this.callback.bind(this));
        $finalImages.each((index, image) => {
            observer.observe(image);
        });
    };

    this.callback = function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                this.handleImageIntersection(entry);
            }
        }, this);
    };

    this.handleImageIntersection = function (entry) {
        if (entry.target.complete) {
            this.fadeOutThumbnail(entry);
        } else {
            $(entry.target).on('load', () => {
                if (entry.target.complete) {
                    this.fadeOutThumbnail(entry);
                }
            });
        }
    };

    this.fadeOutThumbnail = function (entry) {
        const $target = entry.target;
        const $thumbnail = $target.previousElementSibling ? $(entry.target.previousElementSibling) : $(entry.target.nextElementSibling);
        if ($thumbnail.length > 0) {
            $thumbnail.css('opacity', '0').fadeOut(this.animeTime);
        } else {
            console.log("no thumbnail");
        }
    };
}