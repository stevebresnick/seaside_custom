/**
 * @file
 * fin sub-theme behaviors.
 *
 */
(function($, Drupal) {

  /**
   * fin demo theme custom javascript.
   */

  //FOUC fix for menu
  function showMenu() {
    $('#top-bar-sticky-container').show();
  }

  $(document).ready(function() {
    if (Foundation.MediaQuery.atLeast('medium')) {
      showMenu();
    };

    $(window).on('changed.zf.mediaquery', function(event, medium, small) {
      showMenu();
    });
  });

  //remove sticky nav when Quickedit is turned on as it causes all kinds of complications
  Drupal.behaviors.qe = {
      attach: function(context, settings) {
        $(document).on('DOMNodeInserted', function(e) {
          if (e.target.id == 'quickedit-entity-toolbar') {
            $('body').addClass('quickedit-on');
            $('.top-bar-wrapper .sticky').removeAttr('data-sticky').removeClass('sticky');
          }
        });
        $(document).on('DOMNodeRemoved', function(e) {
          if (e.target.id == 'quickedit-entity-toolbar') {
            $('body').removeClass('quickedit-on');
            $('.top-bar-wrapper .sticky-container > div').addClass('sticky').attr('data-sticky');
          }
        });
      }
    },

    //temp fix until this is resolved: http://foundation.zurb.com/forum/posts/38056-responsive-navigation-problem
    Drupal.behaviors.FoundationMenu = {
      attach: function(context, settings) {
        var Icon = $('button.menu-icon');
        var topbar = $('.top-bar');
        var topbarDrop = $('.topbar-toplevel');
        Icon.click(function(t) {
          topbarDrop.toggleClass('vertical');
        });

        $(window).on('changed.zf.mediaquery', function(event, medium, small) {
          if ((topbarDrop).hasClass('vertical')) {
            topbarDrop.toggleClass('vertical');
          }
        });

      }
    };

  //another foundation bug on resize. When the window resizes, the hidden dropdown page causes the page to expand beyond window size. 
  //it only uses visibilitiy hidden, but we need display none
  Drupal.behaviors.FoundationUser = {
    attach: function(context, settings) {
      var dropDownButton = $('.login-dropdown-button');
      var languageDownButton = $('.language-dropdown-button');
      var dropDownPane = $('.dropdown-pane');
      var languagePane = $('.language-pane');
      //add class on page load
      $(document).ready(function() {
          dropDownPane.addClass('display-none');
          languagePane.addClass('display-none');
        }),
        //toggle class on click
        dropDownButton.on('click', function() {
          dropDownPane.removeClass('display-none');
        });
      languageDownButton.on('click', function() {
        languagePane.removeClass('display-none');
      });
    }
  };

  //Sometimes we get weird issues with images not loading due to image styles, so at least provide a fallback
  Drupal.behaviors.imgError = {
    attach: function(context, settings) {
      $('img').one('error', function() {
        var image = this;
        var thisSrc = this.src;
        var matchSitesDefault = thisSrc.match(/\/sites\/(.*)\/files\/styles\//);
        var width = $(image).attr('width');
        var height = $(image).attr('height');

        if (matchSitesDefault) {
          console.log('ATTENTION: The image on this page may be broken because a Dev Desktop bug, please go to /admin/appearance/ and save the form');
        }
        //If both elements are undefined, just hide them
        if (!height && !width) {
          $(image).hide();
          console.log('404 broken image hidden with this path:' + thisSrc);
        } else {
          //take attr and move it to css height/width. then display the 
          $(image).wrap("<span class='broken-image-wrap'></span>");
          $(image).parent().css({
            'height': height,
            'width': width,
          });
          //still hide the image to remove browser default icon, because we are now using background image.
          $(image).hide();
        }
      });
    }
  };

  //navbar with mobile menu look on desktop
  function SetMenuState() {
    var menuIcon = $('.main-menu-icon');
    var menuBox = $('.top-bar-right ul');
    //var menuWrap = $('.top-bar-right');

    menuBox.toggleClass('main-menu-open');
    menuIcon.toggleClass('hover');
    if (menuBox.hasClass('main-menu-open')) {
      localStorage.setItem('lastState', 'on');
    } else {
      localStorage.setItem('lastState', 'off');
    }
  };

  // Ignore our logic surrounding the menu icon based on the drupal settings.
  if (drupalSettings.fin && !drupalSettings.fin.desktop_mobile_menu_icon) {
    $('.top-bar-right ul').addClass('main-menu-open');
    $('.main-menu-icon').hide();
  } else {
    $('.main-menu-icon').click(function() {
      SetMenuState();
    });

    $(document).ready(function() {
      var checkStatus = localStorage.getItem('lastState') || 'false';
      //turn it on by default
      SetMenuState();
      //turn if off, if localstorage tells you to
      if (checkStatus == 'off') {
        SetMenuState();
      }
    });
  }

  Drupal.behaviors.absoluteNav = {
    attach: function(context, settings) {
      var hero = $('.hero .field-name-field-hero-image').closest('.hero');
      if (hero.index() == 0 && hero.parent().index() == 0) {
        $('#top-bar-sticky-container').addClass('absoluteNav');
      } else {
        $('#top-bar-sticky-container').removeClass('absoluteNav');
      }
    }
  };

  Drupal.behaviors.searchBox = {
    attach: function(context, settings) {
      $('#search-block-form .form-submit').once().after('<i class="searchbox-icon meta-icon-size icon ion-ios-search"></i>');
      $('.block-searchform #search-block-form', context).addClass('searchbox');
      $('.block-searchform .form-search').attr('placeholder', 'Search...   ');
      var submitIcon = $('.searchbox-icon');
      var inputBox = $('.form-search');
      var searchBox = $('.searchbox');
      var isOpen = false;
      submitIcon.click(function() {
        if (isOpen == false) {
          searchBox.addClass('searchbox-open');
          submitIcon.addClass('hover');
          inputBox.focus();
          isOpen = true;
        } else {
          searchBox.removeClass('searchbox-open');
          submitIcon.removeClass('hover');
          inputBox.focusout();
          isOpen = false;
        }
      });
      submitIcon.mouseup(function() {
        return false;
      });
      searchBox.mouseup(function() {
        return false;
      });
      $(document).mouseup(function() {
        if (isOpen == true) {
          $('.searchbox-icon').css('display', 'block');
          submitIcon.click();
        }
      });
    }
  };

  // Display a custom modal for FIN.
  Drupal.behaviors.finModal = {
    attach: function(context, settings) {
      if (settings.fin && settings.fin.modal) {
        var output =
          '<div id="fin-modal" data-reveal data-animation-in="fade-in" data-animation-out="fade-out" class="fin-modal-message reveal">' +
          '  <div>' +
          '    <i class="icon ion-ios-checkmark-outline fa-4x"></i>' +
          '    <h2>' + Drupal.t('Thank You') + '</h2>' +
          '    <p>' + Drupal.checkPlain(settings.fin.modal) + '</p>' +
          '    <button class="close-button" aria-label="Close reveal" type="button" data-close><span aria-hidden="true">&times;</span></button>' +
          '  </div>' +
          '</div>';
        $('html').append(output);
        $('#fin-modal').foundation().foundation('open');
        delete settings.fin.modal;
      }
    }
  }

  //generically let user known when fields have been filled. 
  //This is because some prefilled fields get proper labels; and its odd to not add the success label as you fill out. 
  //this does NOT do validation, though.

  Drupal.behaviors.formFilled = {
    attach: function(context, settings) {
      var formID = $('.contact-form');
      var checkbox = $('.form-checkbox');
      var radio = $('.form-radio');
      var textArea = $('.form-textarea');
      var textItem = $('.form-text');
      var select = $('.form-select');

      function isChecked() {

        $(this).each(function() {
          $(this).prop('checked') ? $(this).next('label').addClass('item-selected') : $(this).next('label').removeClass('item-selected');

        });
        var limit = 3;
        if ($(this).parent().siblings().children(':checked').length > limit) {
          $(this).closest('fieldset').find('legend').addClass('alert');
          $(this).closest('fieldset').find('.description').addClass('alert');
        } else {
          $(this).closest('fieldset').find('legend').removeClass('alert');
          $(this).closest('fieldset').find('.description').removeClass('alert');
        }

      }

      function isFilled() {
        $(this).each(function() {
          ($(this).val().trim().length > 0) ? $(this).closest('.form-item').find('label').addClass('item-selected'): $(this).closest('.form-item').find('label').removeClass('item-selected')

        })

      }

      $(document).change(function() {
        if (formID.length) {
          isChecked.call(checkbox);
          isChecked.call(radio);
          isFilled.call(textArea);
          isFilled.call(textItem);
          isFilled.call(select);
        }

      });

      $(document).ready(function() {
        if (formID.length) {
          isChecked.call(checkbox);
          isChecked.call(radio);
          isFilled.call(textArea);
          isFilled.call(textItem);
          isFilled.call(select);
        }

      });
    }
  };

  Drupal.behaviors.lf = {
    attach: function(context) {
      $('.locationReady .view-id-location_finder input[type="submit"]').once().click(function() {
        $('body').addClass('locationSelected');
      });
    }
  };
  Drupal.behaviors.last_menu_as_cta = {
    attach: function(context, settings) {
      if (drupalSettings.fin && drupalSettings.fin.last_menu_as_cta) {
        $('.topbar-toplevel > li:last-child a').addClass('button alert small');
      } else {
       return false;
      }
    }
  }


  //fullback for full width rows. To break out of the row width, it requires two divs. I forsee people not putting the second div in. so there is this.
  // $(document).ready(function() {
  //     fullWidthInner();

  //     function fullWidthInner() {
  //         $("#main .full-width-row:not(:has(.full-width-inner))").wrapInner('<div class="full-width-inner"></div>');
  //     }
  // });

})(jQuery, Drupal);
