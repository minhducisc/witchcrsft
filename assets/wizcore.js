(function ($) {
    if ($(".collection-sidebar")) {
        //work only in collection page
        History.Adapter.bind(window, 'statechange', function () {
            var State = History.getState();
            if (!wizcore.isSidebarAjaxClick) {
                wizcore.sidebarParams();
                var newurl = wizcore.sidebarCreateUrl();
                wizcore.sidebarGetContent(newurl);
                wizcore.reActivateSidebar();
            }
            wizcore.isSidebarAjaxClick = false;
        });
    }

    if (window.use_color_swatch) {
        $('.swatch :radio').change(function () {
            var optionIndex = $(this).closest('.swatch').attr('data-option-index');
            var optionValue = $(this).val();
            $(this)
                .closest('form')
                .find('.single-option-selector')
                .eq(optionIndex)
                .val(optionValue)
                .trigger('change');
        });

        // (c) Copyright 2014 Caroline Schnapp. All Rights Reserved. Contact: mllegeorgesand@gmail.com
        // See http://docs.shopify.com/manual/configuration/store-customization/advanced-navigation/linked-product-options

        Shopify.optionsMap = {};

        Shopify.updateOptionsInSelector = function (selectorIndex) {

            switch (selectorIndex) {
                case 0:
                    var key = 'root';
                    var selector = $('.single-option-selector:eq(0)');
                    break;
                case 1:
                    var key = $('.single-option-selector:eq(0)').val();
                    var selector = $('.single-option-selector:eq(1)');
                    break;
                case 2:
                    var key = $('.single-option-selector:eq(0)').val();
                    key += ' / ' + $('.single-option-selector:eq(1)').val();
                    var selector = $('.single-option-selector:eq(2)');
            }

            var initialValue = selector.val();
            selector.empty();
            var availableOptions = Shopify.optionsMap[key];
            if (availableOptions && availableOptions.length) {
                for (var i = 0; i < availableOptions.length; i++) {
                    var option = availableOptions[i];
                    var newOption = $('<option></option>').val(option).html(option);
                    selector.append(newOption);
                }
                $('.swatch[data-option-index="' + selectorIndex + '"] .swatch-element').each(function () {
                    if ($.inArray($(this).attr('data-value'), availableOptions) !== -1) {
                        $(this).removeClass('soldout').show().find(':radio').removeAttr('disabled', 'disabled').removeAttr('checked');
                    } else {
                        $(this).addClass('soldout').hide().find(':radio').removeAttr('checked').attr('disabled', 'disabled');
                    }
                });
                if ($.inArray(initialValue, availableOptions) !== -1) {
                    selector.val(initialValue);
                }
                selector.trigger('change');
            }
        };

        Shopify.linkOptionSelectors = function (product) {
            // Building our mapping object.
            for (var i = 0; i < product.variants.length; i++) {
                var variant = product.variants[i];
                if (variant.available) {
                    // Gathering values for the 1st drop-down.
                    Shopify.optionsMap['root'] = Shopify.optionsMap['root'] || [];
                    Shopify.optionsMap['root'].push(variant.option1);
                    Shopify.optionsMap['root'] = Shopify.uniq(Shopify.optionsMap['root']);
                    // Gathering values for the 2nd drop-down.
                    if (product.options.length > 1) {
                        var key = variant.option1;
                        Shopify.optionsMap[key] = Shopify.optionsMap[key] || [];
                        Shopify.optionsMap[key].push(variant.option2);
                        Shopify.optionsMap[key] = Shopify.uniq(Shopify.optionsMap[key]);
                    }
                    // Gathering values for the 3rd drop-down.
                    if (product.options.length === 3) {
                        var key = variant.option1 + ' / ' + variant.option2;
                        Shopify.optionsMap[key] = Shopify.optionsMap[key] || [];
                        Shopify.optionsMap[key].push(variant.option3);
                        Shopify.optionsMap[key] = Shopify.uniq(Shopify.optionsMap[key]);
                    }
                }
            }
            // Update options right away.
            Shopify.updateOptionsInSelector(0);
            if (product.options.length > 1) Shopify.updateOptionsInSelector(1);
            if (product.options.length === 3) Shopify.updateOptionsInSelector(2);
            // When there is an update in the first dropdown.
            $(".single-option-selector:eq(0)").change(function () {
                Shopify.updateOptionsInSelector(1);
                if (product.options.length === 3) Shopify.updateOptionsInSelector(2);
                return true;
            });
            // When there is an update in the second dropdown.
            $(".single-option-selector:eq(1)").change(function () {
                if (product.options.length === 3) Shopify.updateOptionsInSelector(2);
                return true;
            });

        };
    }

    $(document).ready(function () {
        wizcore.init();
    });

    $(window).resize(function () {
        wizcore.initMobileMenu();
        //wizcore.initMobileSidebar();
        wizcore.initResizeImage();
    });

    $(window).scroll(function () {
        if ($(this).scrollTop() > 200) {
            $('#back-top').fadeIn();
        } else {
            $('#back-top').fadeOut();
        }
    });

    if (!$(".header-mobile").is(":visible")) {
        $(document).on('click touchstart', function (e) {
            var quickview = $(".quick-view");
            var dropdowncart = $("#dropdown-cart");
            var cartButton = $("#cartToggle");
            var newsletter = $("#email-modal .modal-window");
            var searchBar = $(".nav-search");
            //close quickview and dropdowncart when clicking outside
            if (!quickview.is(e.target) && quickview.has(e.target).length === 0 && !dropdowncart.is(e.target) && dropdowncart.has(e.target).length === 0 && !cartButton.is(e.target) && cartButton.has(e.target).length === 0 && !newsletter.is(e.target) && newsletter.has(e.target).length === 0 && !searchBar.is(e.target) && searchBar.has(e.target).length === 0) {
                wizcore.closeQuickViewPopup();
                wizcore.closeDropdownCart();
                wizcore.closeEmailModalWindow();
                wizcore.closeDropdownSearch();
            }
        });
    }

    $(document).keyup(function (e) {
        if (e.keyCode == 27) {
            wizcore.closeQuickViewPopup();
            wizcore.closeDropdownCart();
            wizcore.closeDropdownSearch();
            clearTimeout(wizcore.wizcoreTimeout);
            if ($('.modal').is(':visible')) {
                $('.modal').fadeOut(500);
            }
        }
    });

    var wizcore = {
        wizcoreTimeout: null,
        isSidebarAjaxClick: false,
        init: function () {
            this.initColorSwatchGrid();
            this.initResizeImage();
            this.initMobileMenu();
            this.initSidebar();
            this.initMobileSidebar();
            this.initScrollTop();
            this.initQuickView();
            this.initCloudzoom();
            this.initProductMoreview();
            this.initAddToCart();
            this.initModal();
            this.initProductAddToCart();
            this.initDropDownCart();
            this.initDropdownSearch();
            this.initToggleCollectionPanel();
            this.initWishlist();
            this.initProductWishlist();
            this.initRemoveWishlist();
            this.initInfiniteScrolling();
        },
        sidebarMapTagEvents: function () {
            $('.filter-content label').click(function (e) {
                console.log('licked');

                var currentTags = [];
                if (Shopify.queryParams.constraint) {
                    currentTags = Shopify.queryParams.constraint.split('+');
                }

                //one selection or multi selection
                if (!window.enable_sidebar_multiple_choice && !$(this).find('input').is(":checked")) {
                    //remove other selection first
                    var otherTag = $(this).parents('.filter-content').find("input:checked");
                    if (otherTag.length > 0) {
                        var tagName = otherTag.val();
                        if (tagName) {
                            var tagPos = currentTags.indexOf(tagName);
                            if (tagPos >= 0) {
                                //remove tag
                                currentTags.splice(tagPos, 1);
                            }
                        }
                    }
                }


                var tagName = $(this).find('input').val();




                if (tagName) {
                    tagName = tagName.replace(/ /g,'-');


                    var tagPos = currentTags.indexOf(tagName);
                    if (tagPos >= 0) {
                        //tag already existed, remove tag
                        currentTags.splice(tagPos, 1);
                      $(this).find('input').prop("checked",false);
                    } else {
                        //tag not existed
                        currentTags.push(tagName);
                      	$(this).find('input').prop("checked",true);
                    }
                }



                if (currentTags.length) {
                    Shopify.queryParams.constraint = currentTags.join('+');
                } else {
                    delete Shopify.queryParams.constraint;
                }


                wizcore.sidebarAjaxClick();
                e.preventDefault();
            });
        },
        sidebarMapCategories: function () {
            $(".sidebar-links a").click(function (e) {
                if (!$(this).hasClass('active')) {
                    delete Shopify.queryParams.q;
                    wizcore.sidebarAjaxClick($(this).attr('href'));

                    //activate selected category
                    $(".sidebar-links a.active").removeClass("active");
                    $(this).addClass("active");
                }
                e.preventDefault();
            });
        },
        sidebarMapView: function () {
            $(".view-mode a").click(function (e) {
                if (!$(this).hasClass("active")) {
                    var paging = $(".filter-show > button span").text();
                    if ($(this).hasClass("list")) {
                        Shopify.queryParams.view = "list" + paging;
                    } else {
                        Shopify.queryParams.view = paging;
                    }

                    wizcore.sidebarAjaxClick();
                    $(".view-mode a.active").removeClass("active");
                    $(this).addClass("active");
                }
                e.preventDefault();
            });
        },
        sidebarMapShow: function () {
            $(".filter-show a").click(function (e) {
                if (!$(this).parent().hasClass("active")) {
                    var thisPaging = $(this).attr('href');

                    var view = $(".view-mode a.active").attr("href");
                    if (view == "list") {
                        Shopify.queryParams.view = "list" + thisPaging;
                    } else {
                        Shopify.queryParams.view = thisPaging;
                    }

                    wizcore.sidebarAjaxClick();
                    $(".filter-show > button span").text(thisPaging);
                    $(".filter-show li.active").removeClass("active");
                    $(this).parent().addClass("active");
                }
                e.preventDefault();
            });
        },
        sidebarInitToggle: function () {
            if ($(".filter-content").length > 0) {
                $(".filter-content .widget-title span").click(function () {
                    var $title = $(this).parents('.widget-title');
                    if ($title.hasClass('click')) {
                        $title.removeClass('click');
                    } else {
                        $title.addClass('click');
                    }

                    $(this).parents(".filter-content").find(".widget-content").slideToggle();
                });
            }
        },
        sidebarMapSorting: function (e) {
           $(".wrap-sort-content label").change(function () {
                    Shopify.queryParams.sort_by = $(this).find('input').val();
                    wizcore.sidebarAjaxClick();
                    var sortbyText = $(this).text();
                    $(".filter-sortby > button span").text(sortbyText);
            });
        },
        sidebarMapPaging: function () {
            $(".pagination-page a").click(function (e) {
                var page = $(this).attr("href").match(/page=\d+/g);
                if (page) {
                    Shopify.queryParams.page = parseInt(page[0].match(/\d+/g));
                    if (Shopify.queryParams.page) {
                        var newurl = wizcore.sidebarCreateUrl();
                        wizcore.isSidebarAjaxClick = true;
                        History.pushState({
                            param: Shopify.queryParams
                        }, newurl, newurl);
                        wizcore.sidebarGetContent(newurl);
                        //go to top
                        $('body,html').animate({
                            scrollTop: 500
                        }, 600);
                    }
                }
                e.preventDefault();
            });
        },
        sidebarMapClearAll: function () {
            //clear all selection
            $('a.clear-all').click(function (e) {
                delete Shopify.queryParams.constraint;
                delete Shopify.queryParams.q;
                wizcore.sidebarAjaxClick();
                e.preventDefault();
            });
        },
        sidebarMapClear: function () {
            $(".filter-content").each(function () {
                var sidebarTag = $(this);
                if (sidebarTag.find("input:checked").length > 0) {
                    //has active tag
                    sidebarTag.find(".clear").show().click(function (e) {
                        console.log("im clicked");
                        var currentTags = [];
                        if (Shopify.queryParams.constraint) {
                            currentTags = Shopify.queryParams.constraint.split('+');
                        }
                        sidebarTag.find("input:checked").each(function () {
                            var selectedTag = $(this);
                            var tagName = selectedTag.val();
                            if (tagName) {
                                var tagPos = currentTags.indexOf(tagName);
                                if (tagPos >= 0) {
                                    //remove tag
                                    currentTags.splice(tagPos, 1);
                                }
                            }
                        });
                        if (currentTags.length) {
                            Shopify.queryParams.constraint = currentTags.join('+');
                        } else {
                            delete Shopify.queryParams.constraint;
                        }
                        wizcore.sidebarAjaxClick();
                        e.preventDefault();
                    });
                }
            });
        },
        sidebarMapEvents: function () {
            wizcore.sidebarMapTagEvents();
            wizcore.sidebarMapCategories();
            wizcore.sidebarMapView();
            wizcore.sidebarMapShow();
            wizcore.sidebarMapSorting();
        },
        reActivateSidebar: function () {
            $(".sidebar-custom .active, .sidebar-links .active").removeClass("active");
            $(".filter-content input:checked").attr("checked", false);

            //category
            var cat = location.pathname.match(/\/collections\/(.*)(\?)?/);
            if (cat && cat[1]) {
                $(".sidebar-links a[href='" + cat[0] + "']").addClass("active");
            }

            //view mode and show filter
            if (Shopify.queryParams.view) {
                $(".view-mode .active").removeClass("active");
                var view = Shopify.queryParams.view;
                if (view.indexOf("list") >= 0) {
                    $(".view-mode .list").addClass("active");
                    //paging
                    view = view.replace("list", "");
                } else {
                    $(".view-mode .grid").addClass("active");
                }
                $(".filter-show > button span").text(view);
                $(".filter-show li.active").removeClass("active");
                $(".filter-show a[href='" + view + "']").parent().addClass("active");
            }
            wizcore.initSortby();
        },
        initSortby: function () {
            //sort by filter
            if (Shopify.queryParams.sort_by) {
                var sortby = Shopify.queryParams.sort_by;
                var sortbyText = $(".filter-sortby a[href='" + sortby + "']").text();
                $(".filter-sortby > button span").text(sortbyText);
                $(".filter-sortby li.active").removeClass("active");
                $(".filter-sortby a[href='" + sortby + "']").parent().addClass("active");
            }
        },
        sidebarMapData: function (data) {
            var currentList = $(".col-main .content-right");
            if (currentList.length == 0) {
                currentList = $(".col-main .product-list");
            }
            var productList = $(data).find(".col-main .content-right");
            if (productList.length == 0) {
                productList = $(data).find(".col-main .product-list");
            }
            if (productList.length > 0 && productList.hasClass("content-right")) {
                if (window.product_image_resize) {
                    productList.find('img').fakecrop({
                        fill: window.images_size.is_crop,
                        widthSelector: ".content-right .grid-item .product-image",
                        ratioWrapper: window.images_size
                    });
                }
            }
            currentList.replaceWith(productList);
            //convert currency
            if (wizcore.checkNeedToConvertCurrency()) {
                Currency.convertAll(window.shop_currency, jQuery('#currencies').val(), '.col-main span.money', 'money_format');
            }

            //replace paging
            if ($(".padding").length > 0) {
                $(".padding").replaceWith($(data).find(".padding"));
            } else {
                $(".block-row.col-main").append($(data).find(".padding"));
            }

            //replace title & description
            var currentHeader = $(".page-header");
            var dataHeader = $(data).find(".page-header");
            if (currentHeader.find("h2").text() != dataHeader.find("h2").text()) {
                currentHeader.find("h2").replaceWith(dataHeader.find("h2"));
                if (currentHeader.find(".rte").length) {
                    if (dataHeader.find(".rte").length) {
                        currentHeader.find(".rte").replaceWith(dataHeader.find(".rte"));
                    } else {
                        currentHeader.find(".rte").hide();
                    }
                } else {
                    if (dataHeader.find(".rte").length) {
                        currentHeader.find("h2").after(dataHeader.find(".rte"));
                    }
                }
            }

            //replace refined
            $(".refined-widgets").replaceWith($(data).find(".refined-widgets"));

            //replace tags
            $(".sidebar-block").replaceWith($(data).find(".sidebar-block"));

            wizcore.initColorSwatchGrid();

            //product review
            if ($(".spr-badge").length > 0) {
                return window.SPR.registerCallbacks(), window.SPR.initRatingHandler(), window.SPR.initDomEls(), window.SPR.loadProducts(), window.SPR.loadBadges();
            }
        },
        sidebarCreateUrl: function (baseLink) {
            var newQuery = $.param(Shopify.queryParams).replace(/%2B/g, '+');
            if (baseLink) {
                //location.href = baseLink + "?" + newQuery;
                if (newQuery != "")
                    return baseLink + "?" + newQuery;
                else
                    return baseLink;
            }
            return location.pathname + "?" + newQuery;
        },
        sidebarAjaxClick: function (baseLink) {
            delete Shopify.queryParams.page;
            var newurl = wizcore.sidebarCreateUrl(baseLink);
          	console.log(newurl);
            wizcore.isSidebarAjaxClick = true;
            History.pushState({
                param: Shopify.queryParams
            }, newurl, newurl);
            wizcore.sidebarGetContent(newurl);
        },
        sidebarGetContent: function (newurl) {
            $.ajax({
                type: 'get',
                url: newurl,
                beforeSend: function () {
                    wizcore.showLoading();
                },
                success: function (data) {
                    wizcore.sidebarMapData(data);
                    wizcore.sidebarMapPaging();
                    wizcore.translateBlock(".main-content");
                    //wizcore.sidebarMapTagEvents();
                    wizcore.sidebarInitToggle();
                    wizcore.sidebarMapClear();
                    wizcore.sidebarMapClearAll();
                    wizcore.hideLoading();
                    wizcore.initQuickView();
                    wizcore.initAddToCart();
                    wizcore.initWishlist();
                    wizcore.initInfiniteScrolling();
                },
                error: function (xhr, text) {
                    wizcore.hideLoading();
                    $('.loading-modal').hide();
                    $('.ajax-error-message').text($.parseJSON(xhr.responseText).description);
                    wizcore.showModal('.ajax-error-modal');
                }
            });
        },
        sidebarParams: function () {
            Shopify.queryParams = {};
            //get after ?...=> Object {q: "Acme"} 
            if (location.search.length) {
                for (var aKeyValue, i = 0, aCouples = location.search.substr(1).split('&'); i < aCouples.length; i++) {
                    aKeyValue = aCouples[i].split('=');
                    if (aKeyValue.length > 1) {
                        Shopify.queryParams[decodeURIComponent(aKeyValue[0])] = decodeURIComponent(aKeyValue[1]);
                    }
                }
            }
        },
        initMobileSidebar: function () {
            //if ($(".header-mobile").is(":visible")) {
            $('footer').append("<a class='option-sidebar left' id='displayTextLeft' href='javascript:void(0)' title='Show Sidebar'><span>Show Sidebar</span></a>");
            $('#displayTextLeft').click(
                function (event) {
                    event.preventDefault();
                    if ($('.sidebar').is(":hidden")) {
                        //jQuery('.col-main').fadeOut(800);
                        $('.sidebar').fadeIn(800);
                        $('body,html').animate({
                            scrollTop: 400
                        }, 600);
                        $('#displayTextLeft').toggleClass('hidden-arrow-left');
                        $('#displayTextLeft').attr('title', 'hide-sidebar');
                        $('#displayTextLeft').html('<span>Hide Sidebar</span>');
                    } else {
                        $('.sidebar').fadeOut(800);
                        $('#displayTextLeft').removeClass('hidden-arrow-left');
                        $('#displayTextLeft').attr('title', 'show-sidebar');
                        $('#displayTextLeft').html('<span>Show Sidebar</span>');
                        //jQuery('.col-main').fadeIn(800);
                    }
                });
            //}
        },
        initSidebar: function () {
            //if category page then init sidebar
            if ($(".collection-sidebar").length > 0) {
                wizcore.sidebarParams();
                wizcore.initSortby();
                wizcore.sidebarMapEvents();
                wizcore.sidebarMapPaging();
                wizcore.sidebarInitToggle();
                wizcore.sidebarMapClear();
                wizcore.sidebarMapClearAll();
            }
        },
        initMobileMenu: function () {
            if ($(".menu-block").is(':visible')) {
                $(".gf-menu-device-container ul.gf-menu li.dropdown").each(function () {
                    if ($(this).find("> p.toogleClick").length == 0) {
                        $(this).prepend('<p class="toogleClick">+</p>');
                    }
                });

                if ($(".menu-block").children().hasClass("gf-menu-device-wrapper") == false) {
                    $(".menu-block").children().addClass("gf-menu-device-wrapper");
                }
                if ($(".gf-menu-device-container").find("ul.gf-menu").size() == 0) {
                    $(".gf-menu-device-container").append($(".nav-bar .container").html());
                    $(".gf-menu-device-container .site-nav").addClass("gf-menu");
                    $(".gf-menu-device-container .site-nav").removeClass("nav")
                }
                $("p.toogleClick").click(function () {
                    if ($(this).hasClass("mobile-toggle-open")) {
                        $(this).next().next().hide();
                        $(this).removeClass("mobile-toggle-open");
                    } else {
                        $(this).next().next().show();
                        $(this).addClass("mobile-toggle-open")
                    }
                });
                $("p.toogleClick").show();
                $("div.gf-menu-toggle").hide();
                $(".nav-bar .container").hide();
                if ($("ul.gf-menu").hasClass("clicked") == false) {
                    $(".gf-menu").hide();
                    $(".gf-menu li.dropdown ul.site-nav-dropdown").hide();
                }


                $(".col-1 .inner ul.dropdown").parent().each(function () {
                    if ($(this).find("> p.toogleClick").length == 0) {
                        $(this).prepend('<p class="toogleClick">+</p>');
                    }
                });

                $(".cbp-spmenu span.icon-dropdown").remove();

                $("ul.gf-menu li.dropdown").each(function () {
                    if ($(this).find("> p.toogleClick").length == 0) {
                        $(this).prepend('<p class="toogleClick">+</p>');
                    }
                });

                $("p.toogleClick").click(function () {
                    if ($(this).hasClass("mobile-toggle-open")) {
                        $(this).next().next().hide();
                        $(this).removeClass("mobile-toggle-open");
                    } else {
                        $(this).next().next().show();
                        $(this).addClass("mobile-toggle-open");
                    }
                });
                $('.header-panel-bottom ul.customer-links').prependTo($('.customer-area .dropdown-menu'));
            } else {
                $(".nav-bar .container").show();
                $(".gf-menu").hide();

                $('.customer-area ul.customer-links').appendTo($('.header-panel-bottom')).after($('.top-header'));
            }
            if ($(".menu-block").children().hasClass("gf-menu-device-wrapper") == false) {
                $(".menu-block").children().addClass("resized");
            }
            ;
        },
        initWishlist: function () {
            $('.grid-item button.wishlist').click(function (e) {
                e.preventDefault();
                var form = $(this).parent();
                var item = form.parents('.grid-item');
                $.ajax({
                    type: 'POST',
                    url: '/contact',
                    data: form.serialize(),
                    beforeSend: function () {
                        wizcore.showLoading();
                    },
                    success: function (data) {
                        wizcore.hideLoading();
                        form.html('<a class="wishlist" href="/pages/wish-list" title="Go to wishlist"><span class="icon"></span><span>Go to wishlist</span></a>');
                        var title = item.find('.product-title').html();
                        var image = item.find('a > img').attr('src');
                        $('.ajax-success-modal').find('.ajax-product-title').html(title);
                        $('.ajax-success-modal').find('.ajax-product-image').attr('src', image);
                        $('.ajax-success-modal').find('.btn-go-to-wishlist').show();
                        $('.ajax-success-modal').find('.btn-go-to-cart').hide();
                        wizcore.showModal('.ajax-success-modal');
                    },
                    error: function (xhr, text) {
                        wizcore.hideLoading();
                        $('.loading-modal').hide();
                        $('.ajax-error-message').text($.parseJSON(xhr.responseText).description);
                        wizcore.showModal('.ajax-error-modal');
                    }
                });
            });
        },
        initProductWishlist: function () {
            $('.product button.wishlist').click(function (e) {
                e.preventDefault();
                var form = $(this).parent();
                var item = form.parents('.grid-item');
                $.ajax({
                    type: 'POST',
                    url: '/contact',
                    data: form.serialize(),
                    beforeSend: function () {
                        wizcore.showLoading();
                    },
                    success: function (data) {
                        wizcore.hideLoading();
                        form.html('<a class="wishlist" href="/pages/wish-list" title="Go to wishlist"><span class="icon"></span><span>Go to wishlist</span></a>');
                        var title = $('.product-title h2').html();
                        var image = $('#product-featured-image').attr('src');
                        $('.ajax-success-modal').find('.ajax-product-title').html(title);
                        $('.ajax-success-modal').find('.ajax-product-image').attr('src', image);
                        $('.ajax-success-modal').find('.btn-go-to-wishlist').show();
                        $('.ajax-success-modal').find('.btn-go-to-cart').hide();
                        wizcore.showModal('.ajax-success-modal');
                    },
                    error: function (xhr, text) {
                        wizcore.hideLoading();
                        $('.loading-modal').hide();
                        $('.ajax-error-message').text($.parseJSON(xhr.responseText).description);
                        wizcore.showModal('.ajax-error-modal');
                    }
                });
            });
        },
        initRemoveWishlist: function () {
            $('.btn-remove-wishlist').click(function (e) {
                var row = $(this).parents('tr');
                var tagID = row.find('.tag-id').val();
                var form = jQuery('#remove-wishlist-form');
                form.find("input[name='contact[tags]']").val('x' + tagID);
                $.ajax({
                    type: 'POST',
                    url: '/contact',
                    data: form.serialize(),
                    beforeSend: function () {
                        wizcore.showLoading();
                    },
                    success: function (data) {
                        wizcore.hideLoading();
                        row.fadeOut(1000);
                    },
                    error: function (xhr, text) {
                        wizcore.hideLoading();
                        $('.loading-modal').hide();
                        $('.ajax-error-message').text($.parseJSON(xhr.responseText).description);
                        wizcore.showModal('.ajax-error-modal');
                    }
                });
            });
        },
        initColorSwatchGrid: function () {
            jQuery('.item-swatch li label').hover(function () {
                var newImage = jQuery(this).parent().find('.hidden a').attr('href');
                jQuery(this).parents('.grid-item').find('.product-grid-image img').attr({src: newImage});
                return false;
            });
        },
        initResizeImage: function () {
            if (window.product_image_resize) {
                $('.products-grid .product-image img').fakecrop({
                    fill: window.images_size.is_crop,
                    widthSelector: ".products-grid .grid-item .product-image",
                    ratioWrapper: window.images_size
                });
            }
        },
        initInfiniteScrolling: function () {
            if ($('.infinite-scrolling').length > 0) {
                $('.infinite-scrolling a').click(function (e) {
                    e.preventDefault();
                    if (!$(this).hasClass('disabled')) {
                        wizcore.doInfiniteScrolling();
                    }
                });
            }
        },
        doInfiniteScrolling: function () {
            var currentList = $('.block-row .products-grid');
            if (!currentList.length) {
                currentList = $('.block-row .product-list');
            }
            if (currentList) {
                var showMoreButton = $('.infinite-scrolling a').first();
                $.ajax({
                    type: 'GET',
                    url: showMoreButton.attr("href"),
                    beforeSend: function () {
                        wizcore.showLoading();
                        $('.loading-modal').show();
                    },
                    success: function (data) {
                        wizcore.hideLoading();
                        var products = $(data).find(".block-row .products-grid");
                        if (!products.length) {
                            products = $(data).find(".block-row .product-list");
                        }
                        if (products.length) {
                            if (products.hasClass('products-grid')) {
                                /*fake crop*/
                                if (window.product_image_resize) {
                                    products.children().find('img').fakecrop({
                                        fill: window.images_size.is_crop,
                                        widthSelector: ".products-grid .grid-item .product-image",
                                        ratioWrapper: window.images_size
                                    });
                                }
                            }

                            currentList.append(products.children());
                            wizcore.translateBlock("." + currentList.attr("class"));
                            wizcore.initQuickView();
                            wizcore.initAddToCart();
                            wizcore.initWishlist();
                            //get link of Show more
                            if ($(data).find('.infinite-scrolling').length > 0) {
                                showMoreButton.attr('href', $(data).find('.infinite-scrolling a').attr('href'));
                            } else {
                                //no more products
                                showMoreButton.hide();
                                showMoreButton.next().show();
                            }

                            //currency
                            if (window.show_multiple_currencies && window.shop_currency != jQuery("#currencies").val()) {
                                Currency.convertAll(window.shop_currency, jQuery("#currencies").val(), "span.money", "money_format")
                            }

                            wizcore.initColorSwatchGrid();

                            //product review
                            if ($(".spr-badge").length > 0) {
                                return window.SPR.registerCallbacks(), window.SPR.initRatingHandler(), window.SPR.initDomEls(), window.SPR.loadProducts(), window.SPR.loadBadges();
                            }
                        }
                    },
                    error: function (xhr, text) {
                        wizcore.hideLoading();
                        $('.loading-modal').hide();
                        $('.ajax-error-message').text($.parseJSON(xhr.responseText).description);
                        wizcore.showModal('.ajax-error-modal');
                    },
                    dataType: "html"
                });
            }
        },
        closeEmailModalWindow: function () {
            if ($('#email-modal').length > 0 && $('#email-modal').is(':visible')) {
                $('#email-modal .modal-window').fadeOut(600, function () {
                    $('#email-modal .modal-overlay').fadeOut(600, function () {
                        $('#email-modal').hide();
                        $.cookie('emailSubcribeModal', 'closed', {
                            expires: 1,
                            path: '/'
                        });
                    });
                });
            }
        },
        showModal: function (selector) {
            $(selector).fadeIn(500)
            wizcore.wizcoreTimeout = setTimeout(function () {
                $(selector).fadeOut(500);
            }, 9999999);
        },
        initToggleCollectionPanel: function () {
            if ($('.collection-sharing-btn').length > 0) {
                $('.collection-sharing-btn').click(function () {
                    $('.collection-sharing-panel').toggle();
                    if ($('.collection-sharing-panel').is(':visible')) {
                        $('.collection-sharing-btn').addClass('btn-hover');
                        $('.collection-filter-panel').hide();
                        $('.collection-filter-btn').removeClass('btn-hover');
                    } else {
                        $('.collection-sharing-btn').removeClass('btn-hover');
                    }
                });
            }
            if ($('.collection-filter-btn').length > 0) {
                $('.collection-filter-btn').click(function () {
                    $('.collection-filter-panel').toggle();
                    if ($('.collection-filter-panel').is(':visible')) {
                        $('.collection-filter-btn').addClass('btn-hover');
                        $('.collection-sharing-panel').hide();
                        $('.collection-sharing-btn').removeClass('btn-hover');
                    } else {
                        $('.collection-filter-btn').removeClass('btn-hover');
                    }
                });
                $('.collection-filter-panel select').change(function (index) {
                    window.location = $(this).find('option:selected').val();
                });
            }
        },
        checkItemsInDropdownCart: function () {
            if ($('#dropdown-cart .mini-products-list').children().length > 0) {
                //Has item in dropdown cart
                $('#dropdown-cart .no-items').hide();
                $('#dropdown-cart .has-items').show();
            } else {
                //No item in dropdown cart                
                $('#dropdown-cart .has-items').hide();
                $('#dropdown-cart .no-items').show();
            }
        },
        initModal: function () {
            $('.continue-shopping').click(function () {
                clearTimeout(wizcore.wizcoreTimeout);
                $('.ajax-success-modal').fadeOut(500);
            });
            $('.close-modal, .overlay').click(function () {
                clearTimeout(wizcore.wizcoreTimeout);
                $('.ajax-success-modal').fadeOut(500);
            });
        },
        initDropDownCart: function () {
            if (window.dropdowncart_type == "click") {
                //click type  
                $('#cartToggle').click(function () {
                    if ($('#dropdown-cart').is(':visible')) {
                        $("#dropdown-cart").slideUp('fast');
                    } else {
                        $("#dropdown-cart").slideDown('fast');
                    }
                });
            } else {
                //hover type
                if (!('ontouchstart' in document)) {
                    $('#cartToggle').hover(function () {
                        if (!$('#dropdown-cart').is(':visible')) {
                            $("#dropdown-cart").slideDown('fast');
                        }
                    });
                    $('.wrapper-top-cart').mouseleave(function () {
                        $("#dropdown-cart").slideUp('fast');
                    });
                } else {
                    //mobile
                    $('#cartToggle').click(function () {
                        if ($('#dropdown-cart').is(':visible')) {
                            $("#dropdown-cart").slideUp('fast');
                        } else {
                            $("#dropdown-cart").slideDown('fast');
                        }
                    });
                }
            }

            wizcore.checkItemsInDropdownCart();

            $('#dropdown-cart .no-items a').click(function () {
                $("#dropdown-cart").slideUp('fast');
            });

            $('#dropdown-cart .btn-remove').click(function (event) {
                event.preventDefault();
                var productId = $(this).parents('.item').attr('id');
                productId = productId.match(/\d+/g);
                Shopify.removeItem(productId, function (cart) {
                    wizcore.doUpdateDropdownCart(cart);
                });
            });
        },
        closeDropdownCart: function () {
            if ($('#dropdown-cart').is(':visible')) {
                $("#dropdown-cart").slideUp('fast');
            }
        },
        initDropdownSearch: function () {
            $('.nav-search .icon-search').click(function () {
                if ($('.header-bottom.on .search-bar').is(':visible')) {
                    $('.header-bottom.on .search-bar').slideUp('fast');
                } else {
                    $('.header-bottom.on .search-bar').slideDown('fast');
                }
            });
        },
        closeDropdownSearch: function () {
            if ($(".header-bottom.on .search-bar").is(":visible")) {
                $(".header-bottom.on .search-bar").slideUp("fast")
            }
        },
        initProductMoreview: function () {
            if ($('.more-view-wrapper-owlslider').length > 0) {
                this.initOwlMoreview();
            } else if ($('.more-view-wrapper-jcarousel').length > 0) {
                this.initJcarouselMoreview();
            }
        },
        initOwlMoreview: function () {
            $('.more-view-wrapper-owlslider ul').owlCarousel({
                navigation: true,
                items: 5,
                itemsDesktop: [1199, 4],
                itemsDesktopSmall: [979, 3],
                itemsTablet: [768, 3],
                itemsTabletSmall: [540, 3],
                itemsMobile: [360, 3]
            }).css('visibility', 'visible');
        },
        initJcarouselMoreview: function () {
            $('.more-view-wrapper-jcarousel ul').jcarousel({
                vertical: true
            }).css('visibility', 'visible');
            $('.product-img-box').addClass('has-jcarousel');
            $('.more-view-wrapper').css('visibility', 'visible');
        },
        initCloudzoom: function () {
            if ($("#product-featured-image").length > 0) {
                if ($(".visible-phone").is(":visible")) {
                    //mobile display
                    $("#product-featured-image").elevateZoom({
                        gallery: 'more-view-carousel',
                        cursor: 'pointer',
                        galleryActiveClass: 'active',
                        imageCrossfade: false,
                        scrollZoom: false,
                        onImageSwapComplete: function () {
                            $(".zoomWrapper div").hide();
                        },
                        loadingIcon: window.loading_url
                    });
                    $("#product-featured-image").bind("click", function (e) {
                        return false;
                    });
                } else {
                    $("#product-featured-image").elevateZoom({
                        gallery: 'more-view-carousel',
                        cursor: 'pointer',
                        galleryActiveClass: 'active',
                        imageCrossfade: true,
                        scrollZoom: true,
                        onImageSwapComplete: function () {
                            $(".zoomWrapper div").hide();
                        },
                        loadingIcon: window.loading_url
                    });

                    $("#product-featured-image").bind("click", function (e) {
                        var ez = $('#product-featured-image').data('elevateZoom');
                        $.fancybox(ez.getGalleryList());
                        return false;
                    });
                }
            }
        },
        initScrollTop: function () {
            $('#back-top').click(function () {
                $('body,html').animate({
                    scrollTop: 0
                }, 400);
                return false;
            });
        },
        initProductAddToCart: function () {
            if ($('#product-add-to-cart').length == 0) {
                $('#product-add-to-cart').on('click', function (event) {
                    event.preventDefault();
                    alert('abc dcm333');

                    if ($(this).attr('disabled') != 'disabled') {
                        if (!window.ajax_cart) {
                            
                            $(this).closest('form').submit();
                        } else {
                            var variant_id = $('#add-to-cart-form select[name=id]').val();
                            if (!variant_id) {
                                variant_id = $('#add-to-cart-form input[name=id]').val();
                            }
                            var quantity = $('#add-to-cart-form input[name=quantity]').val();
                            if (!quantity) {
                                quantity = 1;
                            }
                            var title = $('.product-title h2').html();
                            var image = $('#product-featured-image').attr('src');
                            alert('abc dcm4444');

                            wizcore.doAjaxAddToCart(variant_id, quantity, title, image);
                        }
                    }
                    return false;
                });
            }
        },
        initAddToCart: function () {
            if ($('.add-to-cart-btn').length > 0) {
                $('.add-to-cart-btn').click(function (event) {
                    event.preventDefault();
                    if ($(this).attr('disabled') != 'disabled') {
                        var productItem = $(this).parents('.product-item');
                        var productId = $(productItem).attr('id');
                        productId = productId.match(/\d+/g);
                        if (!window.ajax_cart) {
                            $('#product-actions-' + productId).submit();
                        } else {
                            var variant_id = $('#product-actions-' + productId + ' select[name=id]').val();
                            if (!variant_id) {
                                variant_id = $('#product-actions-' + productId + ' input[name=id]').val();
                            }
                            var quantity = $('#product-actions-' + productId + ' input[name=quantity]').val();
                            if (!quantity) {
                                quantity = 1;
                            }
                            var title = $(productItem).find('.product-title').html();
                            var image = $(productItem).find('.product-grid-image img').attr('src');
                            wizcore.doAjaxAddToCart(variant_id, quantity, title, image);
                        }
                    }
                    return false;
                });
            }
        },
        showLoading: function () {
            $('.loading-modal').show();
        },
        hideLoading: function () {
            $('.loading-modal').hide();
        },
        doAjaxAddToCart: function (variant_id, quantity, title, image) {
            $.ajax({
                type: "post",
                url: "/cart/add.js",
                data: 'quantity=' + quantity + '&id=' + variant_id,
                dataType: 'json',
                beforeSend: function () {
                    wizcore.showLoading();
                },
                success: function (msg) {
                    wizcore.hideLoading();
                    $('.ajax-success-modal').find('.ajax-product-title').html(wizcore.translateText(title));
                    $('.ajax-success-modal').find('.ajax-product-image').attr('src', image);
                    $('.ajax-success-modal').find('.btn-go-to-wishlist').hide();
                    $('.ajax-success-modal').find('.btn-go-to-cart').show();

                    console.log('showing pop up')
                    wizcore.showModal('.ajax-success-modal');
                    wizcore.updateDropdownCart();
                },
                error: function (xhr, text) {
                    wizcore.hideLoading();
                    $('.ajax-error-message').text($.parseJSON(xhr.responseText).description);
                    wizcore.showModal('.ajax-error-modal');
                }
            });
        },
        initQuickView: function () {
            $('.quickview-button a').click(function () {
                var product_handle = $(this).attr('id');
                Shopify.getProduct(product_handle, function (product) {
                    var template = $('#quickview-template').html();
                    $('.quick-view').html(template);
                    var quickview = $('.quick-view');

                    quickview.find('.product-title a').html(wizcore.translateText(product.title));
                    quickview.find('.product-title a').attr('href', product.url);
                    if (quickview.find('.product-vendor span').length > 0) {
                        quickview.find('.product-vendor span').text(product.vendor);
                    }
                    if (quickview.find('.product-type span').length > 0) {
                        quickview.find('.product-type span').text(product.type);
                    }
                    if (quickview.find('.product-inventory span').length > 0) {
                        var variant = product.variants[0];
                        var inventoryInfo = quickview.find('.product-inventory span');
                        if (variant.available) {
                            if (variant.inventory_management != null) {
                                inventoryInfo.text(variant.inventory_quantity + " " + window.inventory_text.in_stock);
                            } else {
                                inventoryInfo.text(window.inventory_text.many_in_stock);
                            }
                        } else {
                            inventoryInfo.text(window.inventory_text.out_of_stock);
                        }
                    }
                    //countdown for quickview
                    if (product.description.indexOf("[countdown]") > 0) {
                        var countdownTime = product.description.match(/\[countdown\](.*)\[\/countdown\]/);
                        if (countdownTime && countdownTime.length > 0) {
                            quickview.find(".countdown").show();
                            quickview.find(".quickview-clock").countdown(countdownTime[1], function (event) {
                                $(this).html(event.strftime('%Dd %H:%M:%S'));
                            });
                        }
                    }
                    if (quickview.find('.product-description').length > 0) {
                        var description = product.description.replace(/(<([^>]+)>)/ig, "");
                        var description = description.replace(/\[countdown\](.*)\[\/countdown\]/g, "");
                        if (window.multi_lang) {
                            if (description.indexOf("[lang2]") > 0) {
                                var descList = description.split("[lang2]");
                                if (jQuery.cookie("language") != null) {
                                    description = descList[translator.current_lang - 1];
                                } else {
                                    description = descList[0];
                                }
                            }
                        }
                        description = description.split(" ").splice(0, 20).join(" ") + "...";
                        quickview.find('.product-description').text(description);
                    } else {
                        quickview.find('.product-description').remove();
                    }

                    quickview.find('.price').html(Shopify.formatMoney(product.price, window.money_format));
                    quickview.find('.product-item').attr('id', 'product-' + product.id);
                    quickview.find('.variants').attr('id', 'product-actions-' + product.id);
                    quickview.find('.variants select').attr('id', 'product-select-' + product.id);

                    //if has compare price
                    if (product.compare_at_price > product.price) {
                        quickview.find('.compare-price').html(Shopify.formatMoney(product.compare_at_price_max, window.money_format)).show();
                        quickview.find('.price').addClass('on-sale');
                    } else {
                        quickview.find('.compare-price').html('');
                        quickview.find('.price').removeClass('on-sale');
                    }

                    //out of stock
                    if (!product.available) {
                        quickview.find("select, input, .total-price, .dec, .inc, .variants label").remove();
                        quickview.find(".add-to-cart-btn").text(window.inventory_text.unavailable).addClass('disabled').attr("disabled", "disabled");
                        ;
                    } else {
                        quickview.find('.total-price span').html(Shopify.formatMoney(product.price, window.money_format));
                        if (window.use_color_swatch) {
                            wizcore.createQuickViewVariantsSwatch(product, quickview);
                        } else {
                            wizcore.createQuickViewVariants(product, quickview);
                        }
                    }

                    //quantity
                    quickview.find(".button").on("click", function () {
                        var oldValue = quickview.find(".quantity").val(),
                            newVal = 1;
                        if ($(this).text() == "+") {
                            newVal = parseInt(oldValue) + 1;
                        } else if (oldValue > 1) {
                            newVal = parseInt(oldValue) - 1;
                        }
                        quickview.find(".quantity").val(newVal);

                        if (quickview.find(".total-price").length > 0) {
                            wizcore.updatePricingQuickview();
                        }
                    });

                    if (window.show_multiple_currencies) {
                        Currency.convertAll(window.shop_currency, jQuery('#currencies').val(), 'span.money', 'money_format');
                    }

                    wizcore.loadQuickViewSlider(product, quickview);
                    wizcore.initQuickviewAddToCart();
                    wizcore.translateBlock(".quick-view");

                    $('.quick-view').fadeIn(500);
                    if ($('.quick-view .total-price').length > 0) {
                        $('.quick-view input[name=quantity]').on('change', wizcore.updatePricingQuickview);
                    }
                });

                return false;
            });

            $('.quick-view .overlay, .close-window').on('click', function () {
                wizcore.closeQuickViewPopup();
                return false;
            });
        },
        updatePricingQuickview: function () {
            //try pattern one before pattern 2
            var regex = /([0-9]+[.|,][0-9]+[.|,][0-9]+)/g;
            var unitPriceTextMatch = $('.quick-view .price').text().match(regex);

            if (!unitPriceTextMatch) {
                regex = /([0-9]+[.|,][0-9]+)/g;
                unitPriceTextMatch = $('.quick-view .price').text().match(regex);
            }

            if (unitPriceTextMatch) {
                var unitPriceText = unitPriceTextMatch[0];
                var unitPrice = unitPriceText.replace(/[.|,]/g, '');
                var quantity = parseInt($('.quick-view input[name=quantity]').val());
                var totalPrice = unitPrice * quantity;

                var totalPriceText = Shopify.formatMoney(totalPrice, window.money_format);
                regex = /([0-9]+[.|,][0-9]+[.|,][0-9]+)/g;
                if (!totalPriceText.match(regex)) {
                    regex = /([0-9]+[.|,][0-9]+)/g;
                }
                totalPriceText = totalPriceText.match(regex)[0];

                var regInput = new RegExp(unitPriceText, "g");
                var totalPriceHtml = $('.quick-view .price').html().replace(regInput, totalPriceText);

                $('.quick-view .total-price span').html(totalPriceHtml);
            }
        },
        initQuickviewAddToCart: function () {
            if ($('.quick-view .add-to-cart-btn').length > 0) {
                $('.quick-view .add-to-cart-btn').click(function () {
                    var variant_id = $('.quick-view select[name=id]').val();
                    if (!variant_id) {
                        variant_id = $('.quick-view input[name=id]').val();
                    }
                    var quantity = $('.quick-view input[name=quantity]').val();
                    if (!quantity) {
                        quantity = 1;
                    }

                    var title = $('.quick-view .product-title a').html();
                    var image = $('.quick-view .quickview-featured-image img').attr('src');
                    wizcore.doAjaxAddToCart(variant_id, quantity, title, image);
                    wizcore.closeQuickViewPopup();
                });
            }
        },
        updateDropdownCart: function () {
            Shopify.getCart(function (cart) {
                wizcore.doUpdateDropdownCart(cart);
            });
        },
        doUpdateDropdownCart: function (cart) {
            var template = '<li class="item" id="cart-item-{ID}"><a href="{URL}" title="{TITLE}" class="product-image"><img src="{IMAGE}" alt="{TITLE}"></a><div class="product-details"><a href="javascript:void(0)" title="Remove This Item" class="btn-remove">X</a><p class="product-name"><a href="{URL}">{TITLE}</a></p><div class="cart-collateral">{QUANTITY} x <span class="price">{PRICE}</span></div></div></li>';

            $('#cartCount').text(cart.item_count);
            /*Total price*/
            $('#dropdown-cart .summary .price').html(Shopify.formatMoney(cart.total_price, window.money_format));
            /*Clear cart*/
            $('#dropdown-cart .mini-products-list').html('');
            /*Add product to cart*/
            if (cart.item_count > 0) {
                for (var i = 0; i < cart.items.length; i++) {
                    var item = template;
                    item = item.replace(/\{ID\}/g, cart.items[i].id);
                    item = item.replace(/\{URL\}/g, cart.items[i].url);
                    item = item.replace(/\{TITLE\}/g, wizcore.translateText(cart.items[i].title));
                    item = item.replace(/\{QUANTITY\}/g, cart.items[i].quantity);
                    item = item.replace(/\{IMAGE\}/g, Shopify.resizeImage(cart.items[i].image, 'small'));
                    item = item.replace(/\{PRICE\}/g, Shopify.formatMoney(cart.items[i].price, window.money_format));
                    $('#dropdown-cart .mini-products-list').append(item);
                }
                $('#dropdown-cart .btn-remove').click(function (event) {
                    event.preventDefault();
                    var productId = $(this).parents('.item').attr('id');
                    productId = productId.match(/\d+/g);
                    Shopify.removeItem(productId, function (cart) {
                        wizcore.doUpdateDropdownCart(cart);
                    });
                });
                if (wizcore.checkNeedToConvertCurrency()) {
                    Currency.convertAll(window.shop_currency, jQuery('#currencies').val(), '#dropdown-cart span.money', 'money_format');
                }
            }
            wizcore.checkItemsInDropdownCart();
        },
        checkNeedToConvertCurrency: function () {
            return window.show_multiple_currencies && Currency.currentCurrency != shopCurrency;
        },
        loadQuickViewSlider: function (product, quickviewTemplate) {
            var featuredImage = Shopify.resizeImage(product.featured_image, 'grande');
            quickviewTemplate.find('.quickview-featured-image').append('<a href="' + product.url + '"><img src="' + featuredImage + '" title="' + product.title + '"/><div style="height: 100%; width: 100%; top:0; left:0 z-index: 2000; position: absolute; display: none; background: url(' + window.loading_url + ') 50% 50% no-repeat;"></div></a>');
            if (product.images.length > 1) {
                var quickViewCarousel = quickviewTemplate.find('.more-view-wrapper ul');
                var count = 0;
                for (i in product.images) {
                    if (count < product.images.length) {
                        var grande = Shopify.resizeImage(product.images[i], 'grande');
                        var compact = Shopify.resizeImage(product.images[i], 'compact');
                        var item = '<li><a href="javascript:void(0)" data-image="' + grande + '"><img src="' + compact + '"  /></a></li>'

                        quickViewCarousel.append(item);
                        count = count + 1;
                    }
                }

                quickViewCarousel.find('a').click(function () {
                    var quickViewFeatureImage = quickviewTemplate.find('.quickview-featured-image img');
                    var quickViewFeatureLoading = quickviewTemplate.find('.quickview-featured-image div');
                    if (quickViewFeatureImage.attr('src') != $(this).attr('data-image')) {
                        quickViewFeatureImage.attr('src', $(this).attr('data-image'));
                        quickViewFeatureLoading.show();
                        quickViewFeatureImage.load(function (e) {
                            quickViewFeatureLoading.hide();
                            $(this).unbind('load');
                            quickViewFeatureLoading.hide();
                        });
                    }
                });
                if (quickViewCarousel.hasClass("quickview-more-views-owlslider")) {
                    wizcore.initQuickViewCarousel(quickViewCarousel);
                } else {
                    wizcore.initQuickViewVerticalMoreview(quickViewCarousel);
                }
            } else {
                quickviewTemplate.find('.quickview-more-views').remove();
                quickviewTemplate.find('.quickview-more-view-wrapper-jcarousel').remove();
            }

        },
        initQuickViewCarousel: function (quickViewCarousel) {
            if (quickViewCarousel) {
                quickViewCarousel.owlCarousel({
                    navigation: true,
                    items: 5,
                    itemsDesktop: [1199, 4],
                    itemsDesktopSmall: [979, 3],
                    itemsTablet: [768, 3],
                    itemsTabletSmall: [540, 3],
                    itemsMobile: [360, 3]
                }).css('visibility', 'visible');
            }
        },
        initQuickViewVerticalMoreview: function (quickViewCarousel) {
            if (quickViewCarousel) {
                quickViewCarousel.jcarousel({
                    vertical: true
                });
                $('.product-img-box').addClass('has-jcarousel');
                $('.more-view-wrapper').css('visibility', 'visible');
            }
        },
        convertToSlug: function (text) {
            return text
                .toLowerCase()
                .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-');
        },
        createQuickViewVariantsSwatch: function (product, quickviewTemplate) {
            if (product.variants.length > 1) { //multiple variants
                for (var i = 0; i < product.variants.length; i++) {
                    var variant = product.variants[i];
                    var option = '<option value="' + variant.id + '">' + variant.title + '</option>';
                    quickviewTemplate.find('form.variants > select').append(option);
                }
                new Shopify.OptionSelectors("product-select-" + product.id, {
                    product: product,
                    onVariantSelected: selectCallbackQuickview
                });

                //start of quickview variant;
                var filePath = window.file_url.substring(0, window.file_url.lastIndexOf('?'));
                var assetUrl = window.asset_url.substring(0, window.asset_url.lastIndexOf('?'));
                var options = "";
                for (var i = 0; i < product.options.length; i++) {
                    options += '<div class="swatch clearfix" data-option-index="' + i + '">';
                    options += '<div class="header">' + product.options[i].name + '</div>';
                    var is_color = false;
                    if (/Color|Colour/i.test(product.options[i].name)) {
                        is_color = true;
                    }
                    var optionValues = new Array();
                    for (var j = 0; j < product.variants.length; j++) {
                        var variant = product.variants[j];
                        var value = variant.options[i];
                        var valueHandle = this.convertToSlug(value);
                        var forText = 'swatch-' + i + '-' + valueHandle;
                        if (optionValues.indexOf(value) < 0) {
                            //not yet inserted
                            options += '<div data-value="' + value + '" class="swatch-element ' + (is_color ? "color" : "") + valueHandle + (variant.available ? ' available ' : ' soldout ') + '">';

                            if (is_color) {
                                options += '<div class="tooltip">' + value + '</div>';
                            }
                            options += '<input id="' + forText + '" type="radio" name="option-' + i + '" value="' + value + '" ' + (j == 0 ? ' checked ' : '') + (variant.available ? '' : ' disabled') + ' />';

                            if (is_color) {
                                options += '<label for="' + forText + '" style="background-color: ' + valueHandle + '; background-image: url(' + filePath + valueHandle + '.png)"><img class="crossed-out" src="' + assetUrl + 'soldout.png" /></label>';
                            } else {
                                options += '<label for="' + forText + '">' + value + '<img class="crossed-out" src="' + assetUrl + 'soldout.png" /></label>';
                            }
                            options += '</div>';
                            if (variant.available) {
                                $('.quick-view .swatch[data-option-index="' + i + '"] .' + valueHandle).removeClass('soldout').addClass('available').find(':radio').removeAttr('disabled');
                            }
                            optionValues.push(value);
                        }
                    }
                    options += '</div>';
                }
                quickviewTemplate.find('form.variants > select').after(options);
                quickviewTemplate.find('.swatch :radio').change(function () {
                    var optionIndex = $(this).closest('.swatch').attr('data-option-index');
                    var optionValue = $(this).val();
                    $(this)
                        .closest('form')
                        .find('.single-option-selector')
                        .eq(optionIndex)
                        .val(optionValue)
                        .trigger('change');
                });
                if (product.available) {
                    Shopify.optionsMap = {};
                    Shopify.linkOptionSelectors(product);
                }

                //end of quickview variant
            } else { //single variant
                quickviewTemplate.find('form.variants > select').remove();
                var variant_field = '<input type="hidden" name="id" value="' + product.variants[0].id + '">';
                quickviewTemplate.find('form.variants').append(variant_field);
            }
        },
        createQuickViewVariants: function (product, quickviewTemplate) {
            if (product.variants.length > 1) { //multiple variants
                for (var i = 0; i < product.variants.length; i++) {
                    var variant = product.variants[i];
                    var option = '<option value="' + variant.id + '">' + variant.title + '</option>';
                    quickviewTemplate.find('form.variants > select').append(option);
                }

                new Shopify.OptionSelectors("product-select-" + product.id, {
                    product: product,
                    onVariantSelected: selectCallbackQuickview
                });

                if (product.options.length == 1) {
                    $('.selector-wrapper:eq(0)').prepend('<label>' + product.options[0].name + '</label>');
                    for (var text = product.variants, r = 0; r < text.length; r++) {
                        var s = text[r];
                        if (!s.available) {
                            jQuery('.single-option-selector option').filter(function () {
                                return jQuery(this).html() === s.title
                            }).remove();
                        }
                    }
                    ;
                }

                $('.quick-view .single-option-selector').selectize();
                $('.quick-view .selectize-input input').attr("disabled", "disabled");

                quickviewTemplate.find('form.variants .selector-wrapper label').each(function (i, v) {
                    $(this).html(product.options[i].name);
                });
            } else { //single variant
                quickviewTemplate.find('form.variants > select').remove();
                var variant_field = '<input type="hidden" name="id" value="' + product.variants[0].id + '">';
                quickviewTemplate.find('form.variants').append(variant_field);
            }

        },
        closeQuickViewPopup: function () {
            $('.quick-view').fadeOut(500);
        },
        translateText: function (str) {
            if (!window.multi_lang || str.indexOf("|") < 0)
                return str;

            if (window.multi_lang) {
                var textArr = str.split("|");
                if (translator.isLang2())
                    return textArr[1];
                return textArr[0];
            }
        },
        translateBlock: function (blockSelector) {
            if (window.multi_lang && translator.isLang2()) {
                translator.doTranslate(blockSelector);
            }
        }
    }
    var inputSearch = $('header .wrap-input input');
    var searchBox = inputSearch.closest('.wrap-input');
    inputSearch.on('focus', function (e) {
        searchBox.addClass('focus');
    });
    $(document).on("click", function (e) {
        if ($(e.target).is(inputSearch) === false) {
            searchBox.removeClass("focus");
        }
    });
    if (window.matchMedia("(max-width: 1023px)").matches) {
        $('.wrap-form-mobile').on('click', function () {
            $('.header-middle').toggleClass('show');
            $('.site-header').toggleClass('show');
            if ($('.overlay-m').hasClass('active')) {
                $('.overlay-m').removeClass('active');
            } else {
                $('.overlay-m').addClass('active');

            }
        });
        $('.overlay-m').on('click', function () {
            $('.header-middle').removeClass('show');
            $('.site-header').removeClass('show');

            if ($(this).hasClass('active')) {
                $(this).removeClass('active');
            }
        });
    }
    $('a.open-m').on('click', function (e) {
        e.preventDefault();
        $('.header-bottom').addClass('active');
    });
    $('a.close-m').on('click', function (e) {
        e.preventDefault();
        if ($('.header-bottom').hasClass('active')) {
            $('.header-bottom').removeClass('active');
        }
    });
    $('#quantity-select').on('change', function () {
        var selectValue = $(this).val();
        console.log(selectValue);
        $('#select-value').text(selectValue);
        $('#quantity').val(selectValue);

    });
    $('.product-variants .swatch-element input').on('change', function () {
        var selectValue = $(this).val();
        console.log(selectValue);
        $('.product-variants .select-value').text(selectValue);

    });
    $('.product-color .swatch-element input').on('change', function () {
        var selectValue = $(this).val();
        console.log(selectValue);
        $('.product-color .select-value').text(selectValue);

    });
    var style_variant= $('.product-variants .swatch-element').length;
    if(style_variant == 5){
        $('.product-variants .select-value').text('One Size');
    }
    else{
        $('.product-variants .select-value').text('S');

    }
    var color_variant= $('.product-color .swatch-element:first-child').data('value');
    $('.product-color .select-value').text(color_variant);
    $('#select-box-style').on('change', function () {
        var get_url = $(this).find(':selected').data('url');
        var get_id = $(this).val();
        $('.inner-rp-img a').removeClass('active');
        $('.inner-rp-img[data-id="'+get_id+'"] a').addClass('active');
        window.location.hash = get_url;
        if(style_variant == 5){
            $('.product-variants .select-value').text('One Size');
        }
        else{
            $('.product-variants .select-value').text('S');

        }
        $('.product-color .select-value').text(color_variant);
    });
    $('.inner-rp-img a').on('click', function (e) {
        e.preventDefault();
        var get_href = $(this).data('href');
        var get_id = $(this).parent().data('id');
        $('.inner-rp-img a').removeClass('active');
        $('.inner-rp-img a[data-href="'+get_href+'"]').addClass('active');
        $('select#select-box-style').val(get_id);
        window.location.hash = get_href;
        if(style_variant == 5){
            $('.product-variants .select-value').text('One Size');
        }
        else{
            $('.product-variants .select-value').text('S');

        }
        $('.product-color .select-value').text(color_variant);
    });
    $('a#size-guide').on('click', function (e) {
        e.preventDefault();
        $('.wrap-modal').addClass('active');
    })
    $('.close-btn a').on('click', function (e) {
        e.preventDefault();
        $('.wrap-modal').removeClass('active');
    })
    $('.unit a').on('click', function (e) {
        e.preventDefault();
        var unitId = $(this).data('id');
        var unitClass = $(this).data('class');
        $('.unit a[data-class="'+unitClass+'"]').addClass('active');
        $('.unit a').not($('.unit a[data-class="'+unitClass+'"]')).removeClass('active');
        $(this).closest('.modal-content').find('.wrap-table').removeClass('show');
        $(this).closest('.modal-content').find($('#' + unitId)).addClass('show');
    })
    $('.wrap-mobile-product-image').owlCarousel({
        nav: true,
        items: 1
    })
    $('.wrap-product-slider').owlCarousel({
        stagePadding: 50,
        loop: true,
        margin: 10,
        nav: true,
        responsive: {
            0: {
                items: 2
            },
            600: {
                items: 4
            }
        }
    })
    $('.wrap-product-image-list').owlCarousel({
        margin:10,
        dots:false,
        responsive:{
            0:{
                items:1
            },
            300:{
                item:4
            },
            600:{
                items:5
            },
            1000:{
                items:7
            }
        }
    })
    $('.product-slider').owlCarousel({
        margin:10,
        dots:false,
        responsive:{
            0:{
                items:1
            },
            300:{
                item:2
            },
            400:{
                items:2
            },
            1000:{
                items:5
            }
        }
    })
    $('.collection-slider').owlCarousel({
        margin:10,
        dots:false,
        responsive:{
            0:{
                items:1
            },
            300:{
                item:2
            },
            400:{
                items:2
            },
            1000:{
                items:5
            }
        }
    })
    $('.filter-title a').on('click', function (e) {
        e.preventDefault();
        var filter_content = $(this).closest('.wrap-filter').find('.filter-content');

        if (filter_content.is(':hidden')) {
            filter_content.slideDown();
            $(this).addClass('show');

        } else {
            filter_content.slideUp();
            $(this).removeClass('show');

        }
    })
    $('button.showall').on('click', function () {
        $(this).next('div').slideDown();
        $(this).hide();
    });
    $('button.hideitem').on('click', function () {
        $(this).parent().slideUp();
        $(this).parent().prev('button').show();
    });
    $('.wrap-filter-menu a').on('click', function (e) {
        e.preventDefault();
        var getID = $(this).data('id');
        $('#' + getID).addClass('show');

    })
    $('.cancel').on('click', function (e) {
        e.preventDefault();
        $(this).closest('.filter-parent').removeClass('show');

    })
    $('.selected-tag').on('click',function (e) {
        e.preventDefault();
        delete Shopify.queryParams.page;

    })
    $('#select-guide').on('change',function () {
        var optionId = $(this).children("option:selected").data('id');
        console.log(optionId);
        $('.modal-content').hide();
        $('.modal-content[data-id="'+ optionId +'"]').show();
    });
    // $(window).load(function () {
    //     var get_window_hash = window.location.search.substr(9);
    //     console.log(get_window_hash);
    //     $('#more-view-carousel .inner-image').hide();
    //     $('#more-view-carousel .inner-image[data-id="'+get_window_hash+'"]').show();
    // });
    var coreJSPt = {
      init: function(){
      	this.autoCheckedInputFilter();

      },
      autoCheckedInputFilter: function(){
        var currentTags = [];
        if (Shopify.queryParams.constraint) {
          currentTags = Shopify.queryParams.constraint.split('+');
        }

        $('.inputcheckbox input').each(function(){
        	var tagName = $(this).val();
            if (tagName) {
              var tagPos = currentTags.indexOf(tagName);
              if (tagPos >= 0) {
                $(this).prop("checked",true);
              } else {
                $(this).prop("checked",false);
              }
            }

        });

      }
    }


    $(document).ready(function(){
    	if($('.collection-sidebar').length > 0) {
            coreJSPt.init();
        }
    	var get_window_hash = window.location.search.substr(9);
        $('#select-box-style option[data-id="'+get_window_hash+'"]').prop('selected',true);

    });
    $(window).load(function() {
        // Animate loader off screen
        $("#product-image-preload").fadeOut("slow");;
    });
   $(document).ready(function($)
    {

        $('.readmore').insertAfter( '.short-des' );

        $('.readmore').click(function (event) {
            event.preventDefault();
            var description = document.querySelector('.short-des');
            console.log(description.style.height)
            if (description.style.height === ''){
                description.style.height = 'auto';
            } else if (description.style.height === 'auto'){
                description.style.height = '';
            }
            else{
                description.style.height = '92px';
            }

            $(this).text($(this).text() == 'Read less...' ? 'Read more...' : 'Read less...');
        });
        $(".qty-button").on("click", function() {

            var $button = $(this);
            var oldValue = $button.parent().find("input.qty").val();

            if ($button.text() == "+") {
                var newVal = parseFloat(oldValue) + 1;
            } else {
                // Don't allow decrementing below zero
                if (oldValue > 0) {
                    var newVal = parseFloat(oldValue) - 1;
                } else {
                    newVal = 0;
                }
            }

            $button.parent().find("input.qty").val(newVal);

        });
    });


})(jQuery);