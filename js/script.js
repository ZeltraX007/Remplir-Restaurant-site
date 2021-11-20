$(function(){ //same as document.addEventListener("DOMContentLoaded".....)
    // Same as document.querySelector(".navbar-toggler").addEventListener("blur...")
    $(".navbar-toggler").blur(function(event) {
        var screenWidth = window.innerWidth; //grab the window width
        if (screenWidth < 975) {
            $(".navbar-collapse").collapse('hide');
        }
    })
});

(function (global) {

    var dc = {};
    
    var homeHtml = "snippets/home-snippet.html";
    var allCategoriesUrl =
      "https://davids-restaurant.herokuapp.com/categories.json";
    var categoriesTitleHtml = "snippets/categories-title-snippet.html";
    var categoryHtml = "snippets/category-snippet.html";
    var menuItemsUrl = "http://davids-restaurant.herokuapp.com/menu_items.json?category=";
    var menuItemsTitleHtml = "snippets/menu-items-title.html";
    var menuItemHtml = "snippets/menu-items.html";
    
    // Convenience function for inserting innerHTML for 'select'
    var insertHtml = function (selector, html) {
      var targetElem = document.querySelector(selector);
      targetElem.innerHTML = html;
    };
    
    // Show loading icon inside element identified by 'selector'.
    var showLoading = function (selector) {
      var html = "<div class='text-center'>";
      html += "<img src='images/ajax-loader.gif'></div>";
      insertHtml(selector, html);
    };
    
    // Return substitute of '{{propName}}'
    // with propValue in given 'string'
    var insertProperty = function (string, propName, propValue) {
      var propToReplace = "{{" + propName + "}}";
      string = string
        .replace(new RegExp(propToReplace, "g"), propValue);
      return string;
    }

    // Remove the class 'active' from home and switch to Menu button
  var switchMenuToActive = function () {
  // Remove 'active' from home button
  var classes = document.querySelector(".navHomeButton").className;
  classes = classes.replace(new RegExp("active", "g"), "");
  document.querySelector(".navHomeButton").className = classes;

  classes = document.querySelector(".navHomeButton1").className;
  classes = classes.replace(new RegExp("active", "g"), "");
  document.querySelector(".navHomeButton1").className = classes;

  // Add 'active' to menu button if not already there
  classes = document.querySelector(".navMenuButton").className;
  if (classes.indexOf("active") == -1) {
    classes += " active";
    document.querySelector(".navMenuButton").className = classes;
  }

  classes = document.querySelector(".navMenuButton1").className;
  if (classes.indexOf("active") == -1) {
    classes += " active";
    document.querySelector(".navMenuButton1").className = classes;
  }
};
    
    // On page load (before images or CSS)
    document.addEventListener("DOMContentLoaded", function (event) {
    
    // On first load, show home view
    showLoading("#main-content");
    $ajaxUtils.sendGetRequest(
      homeHtml,
      function (responseText) {
        document.querySelector("#main-content")
          .innerHTML = responseText;
      },
      false);
    });
    
    // Load the menu categories view
    dc.loadMenuCategories = function () {
      showLoading("#main-content");
      switchMenuToActive();
      $ajaxUtils.sendGetRequest(
        allCategoriesUrl,
        buildAndShowCategoriesHTML);
    };

    dc.loadMenuItems = function (categoryShort){
      showLoading("#main-content");
      $ajaxUtils.sendGetRequest(
        menuItemsUrl + categoryShort, buildAndShowMenuItemsHTML);
    };
    
    
    // Builds HTML for the categories page based on the data
    // from the server
    function buildAndShowCategoriesHTML (categories) {
      // Load title snippet of categories page
      $ajaxUtils.sendGetRequest(
        categoriesTitleHtml,
        function (categoriesTitleHtml) {
          // Retrieve single category snippet
          $ajaxUtils.sendGetRequest(
            categoryHtml,
            function (categoryHtml) {
              var categoriesViewHtml =
                buildCategoriesViewHtml(categories,
                                        categoriesTitleHtml,
                                        categoryHtml);
              insertHtml("#main-content", categoriesViewHtml);
            },
            false);
        },
        false);
    }
    
    
    // Using categories data and snippets html
    // build categories view HTML to be inserted into page
    function buildCategoriesViewHtml(categories,
                                     categoriesTitleHtml,
                                     categoryHtml) {
    
      var finalHtml = categoriesTitleHtml;
      finalHtml += "<div class='container'><div class='row gx-0 justify-content-between'>";
    
      // Loop over categories
      for (var i = 0; i < categories.length; i++) {
        // Insert category values
        var html = categoryHtml;
        var name = "" + categories[i].name;
        var short_name = categories[i].short_name;
        html =
          insertProperty(html, "name", name);
        html =
          insertProperty(html,
                         "short_name",
                         short_name);
        finalHtml += html;
      }
    
      finalHtml += "</div></div>";
      return finalHtml;
    }
    
    function buildAndShowMenuItemsHTML (categoryMenuItems) {
      // Load title snippet of menu items page
      $ajaxUtils.sendGetRequest(
        menuItemsTitleHtml,
        function (menuItemsTitleHtml) {
          // Retrieve single menu item snippet
          $ajaxUtils.sendGetRequest(menuItemHtml,
            function (menuItemHtml) {
              var menuItemsViewHtml =
              buildMenuItemsViewHtml(categoryMenuItems,menuItemsTitleHtml,menuItemHtml);
              insertHtml("#main-content", menuItemsViewHtml);
            },
            false);
        },
      false);
    }

    // Using category and menu items data and snippets html
    //build menu items HTML to be inserted into page
    function buildMenuItemsViewHtml(categoryMenuItems, menuItemsTitleHtml, menuItemHtml) {
      menuItemsTitleHtml = insertProperty(menuItemsTitleHtml,"name", categoryMenuItems.category.name);
      menuItemsTitleHtml = insertProperty(menuItemsTitleHtml, "special_instructions",categoryMenuItems.category.special_instructions);

      var finalHtml = menuItemsTitleHtml;
      finalHtml += "<div class='container'><div class='row gx-0 justify-content-between'>";

      // Loop over menu items
      var menuItems = categoryMenuItems.menu_items;
      var catShortName = categoryMenuItems.category.short_name;
      for (var i = 0; i < menuItems.length; i++) {
        // Insert menu item values
        var html = menuItemHtml;
        html = insertProperty(html, "short_name", menuItems[i].short_name);
        html = insertProperty(html, "catShortName", catShortName);
        html = insertItemPrice(html, "price_small", menuItems[i].price_small);
        html = insertItemPortionName(html, "small_portion_name", menuItems[i].small_portion_name);
        html = insertItemPrice(html, "price_large", menuItems[i].price_large);
        html = insertItemPortionName(html, "large_portion_name", menuItems[i].large_portion_name);
        html = insertProperty(html, "name", menuItems[i].name);
        html = insertProperty(html, "description", menuItems[i].description);

        //add clearfix after every second menu item
        if (i % 2 !=0) {
          html += "<div class='clearfix visible-lg-block visible-md-block'></div>";
        }

        finalHtml += html;
      }

      finalHtml += "</div></div>";
      return finalHtml;
    }

    // Appends price with '$' if price exists
function insertItemPrice(html,
                         pricePropName,
                         priceValue) {
  // If not specified, replace with empty string
  if (!priceValue) {
    return insertProperty(html, pricePropName, "");;
  }

  priceValue = "$" + priceValue.toFixed(2);
  html = insertProperty(html, pricePropName, priceValue);
  return html;
}


// Appends portion name in parens if it exists
function insertItemPortionName(html,
                               portionPropName,
                               portionValue) {
  // If not specified, return original string
  if (!portionValue) {
    return insertProperty(html, portionPropName, "");
  }

  portionValue = "(" + portionValue + ")";
  html = insertProperty(html, portionPropName, portionValue);
  return html;
}
    
    global.$dc = dc;
    
    })(window);