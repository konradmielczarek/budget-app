//  BUDGET CONTROLLER
var budgetController = (function() {

  var Expense = function(id, category, description, value) {
    this.id = id;
    this.category = category;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };


  Expense.prototype.calcPercentage = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  }


  Expense.prototype.getPercentage = function() {
    return this.percentage;
  }


  Expense.prototype.filterExpenses = function(cat) {
    if (this.category === cat) return this.category;
  }


  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };
  

  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1,
    categories: [
      {
        name: 'housing',
        totalExp: 0,
        percentage: 0
      },
      {
        name: 'utilities',
        totalExp: 0,
        percentage: 0
      },
      {
        name: 'food-and-groceries',
        totalExp: 0,
        percentage: 0
      },
      {
        name: 'health-care',
        totalExp: 0,
        percentage: 0
      },
      {
        name: 'holidays',
        totalExp: 0,
        percentage: 0
      },
      {
        name: 'entertainment',
        totalExp: 0,
        percentage: 0
      },
    ]
  };


  var calculateTotal = function(type) {
    var sum = 0;

    data.allItems[type].forEach(function(el) {
      sum += el.value;
    });

    data.totals[type] = sum;
  }


  var filterExpenses = function(cat) {
    var expenses;

    expenses = data.allItems.exp;

    console.log(expenses);

    if (cat === 'all') {
      return expenses;
    } else {
      var filteredExpenses = expenses.filter(function(el) {
        return el.filterExpenses(cat);
      });

      console.log(filteredExpenses);
      return filteredExpenses;
    }
  }


  var calculateTotalCategoryExpenses = function(cat) {
    var sum = 0;

    data.allItems.exp.forEach(function(el) {
      if (el.category === cat) {
        sum += el.value;
      }
    });

    data.categories.forEach(function(el) {
      if (el.name === cat) {
        el.totalExp = sum;
      }
    });

    if (cat === 'all') {
      return data.totals.exp;
    } else {
      return sum;
    }
  }


  var calculateCategoryPercentage = function(cat) {
    var percentage = 0;

    // Gather percentages of particular expenses within category
    data.allItems.exp.forEach(function(el) {
      if (el.category === cat) {
        percentage += el.percentage;
      }
    });

    // Set percentage for specific category
    data.categories.forEach(function(el) {
      if (el.name === cat) {
        el.percentage = percentage;
      }
    });

    if (cat === 'all') {
      return data.percentage;
    } else {
      return percentage;
    }
  }


  return {
    addItem: function(type, cat, desc, val) {
      var newItem, id;

      // Create new ID
      if (data.allItems[type].length === 0) {
        id = 1;
      } else {
        id = data.allItems[type][data.allItems[type].length - 1].id + 1;
      }

      // Create new item based on 'inc' or 'exp' type
      if (type === 'inc') {
        newItem = new Income(id, desc, val);
      } else if (type === 'exp') {
        newItem = new Expense(id, cat, desc, val);
      }

      // Push it into our data structure
      data.allItems[type].push(newItem);

      // Return the new element
      return newItem;
    },


    deleteItem: function(type, id) {
      var ids, index;

      ids = data.allItems[type].map(function(el){
        return el.id;
      });

      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },


    calculateBudget: function() {
      // calculate total income and expenses
      calculateTotal('exp');
      calculateTotal('inc');

      // calculate the budget: income - expenses
      data.budget = data.totals.inc - data.totals.exp;

      // calculate the percentage of income that we spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },


    calculatePercentages: function() {
      data.allItems.exp.forEach(function(el) {
        el.calcPercentage(data.totals.inc);
      });
    },


    getPercentages: function() {
      var allPercentages = data.allItems.exp.map(function(el) {
        return el.getPercentage();
      });

      return allPercentages; 
    },


    getBudget: function() {
      return {
        budget: data.budget,
        totalIncome: data.totals.inc,
        totalExpenses: data.totals.exp,
        percentage: data.percentage
      }
    },


    getCategories: function() {
      // Get categories names
      var categories = data.categories.map(function(el) {
        return el.name;
      });

      return categories.sort();
    },


    getFilteredExpenses: function(cat) {
      return filterExpenses(cat);
    },


    getCategoryTotals: function(cat) {
      return {
        totalExpenses: calculateTotalCategoryExpenses(cat),
        totalCategoryPercentage: calculateCategoryPercentage(cat),
      }
    },


    testing: function() {
      console.log(data);
    }
  }

})();



// UI CONTROLLER
var UIController = (function() {

  var DOMstrings = {
    // Store all dom elements in the app
    inputType: document.querySelector('.add__type'),
    inputCategory: document.querySelector('.add__category'),
    inputDescription: document.querySelector('.add__description'),
    inputValue: document.querySelector('.add__value'),
    inputBtn: document.querySelector('.add__btn'),
    incomeContainer: document.querySelector('.income__list'),
    expensesContainer: document.querySelector('.expenses__list'),
    budgetLabel: document.querySelector('.budget__value'),
    incomeLabel: document.querySelector('.budget__income--value'),
    expensesLabel: document.querySelector('.budget__expenses--value'),
    percentageLabel: document.querySelector('.budget__expenses--percentage'),
    container: document.querySelector('.container'),
    expensesPercentageLabel: '.item__percentage',
    dateLabel: '.budget__title--month',
    inputView: document.getElementById('input-view'),
    // Summary view
    summaryView: document.getElementById('summary-view'),
    viewContainer: document.querySelector('.view__container'),
    inputContent: document.querySelector('.input__content'),
    summaryContent: document.querySelector('.summary__content'),
    selectCategory: document.querySelector('.select__category'),
    expensesSummaryContainer: document.querySelector('.expenses__list.summary'),
    expensesSummary: document.querySelector('.expenses.summary'),
    expensesTitle: document.querySelector('.expenses__title.summary'),
    refreshBtn: document.querySelector('.select__refresh-btn')
  };

  var formatNumber = function(num, type) {
    var numSplit, int, dec;
    
    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split('.');

    int = numSplit[0];

    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
    }

    dec = numSplit[1];

    return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
  }

  var formatCategoryString = function(catString) {
    var string;

    string = catString.replace(/-/g, ' ');
    string = string.charAt(0).toUpperCase() + string.slice(1);

    return string;
  }

  var nodeListForEach = function(list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  var distinguishCategories = function(category) {
    var html;
    
    // Add proper css class and tippy content to item depending on category
    html = '<div class="item item--' + category + ' clearfix tippy" id="inc-%id%" data-tippy-content="' + formatCategoryString(category) + '"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">%percentage%%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

    // Customize tippy tooltips
    tippy('.expenses__list', {
      target: '.tippy',
      arrow: true,
    });

    return html;
  }

  return {
    getInput: function() {
      return {
        type: DOMstrings.inputType.value, // will be either inc or exp
        category: DOMstrings.inputCategory.value,
        description: DOMstrings.inputDescription.value,
        value: parseFloat(DOMstrings.inputValue.value)
      }
    },

    displayCategories: function(categoriesArr, element) {
      var option;

      categoriesArr.forEach(function(el) {
        option = document.createElement('option');
        option.textContent = formatCategoryString(el);
        option.value = el;
        element.appendChild(option);
      });
    },

    addListItem: function(obj, type, category) {
      // Create HTML string with placeholder text
      var html, newHtml, element;
      
      if (type === 'inc') {
        element = DOMstrings.incomeContainer;
        html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === 'exp') {
        element = DOMstrings.expensesContainer;
        html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

        html = distinguishCategories(category);
      }

      // Replace the placeholder text with some actual data
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

      // Insert the HTML into the DOM
      element.insertAdjacentHTML('beforeend', newHtml);
    },

    deleteListItem: function(selectorId) {
      var el = document.getElementById(selectorId);

      el.parentNode.removeChild(el);
    },

    clearFields: function() {
      var fields, fieldsArr;

      fields = document.querySelectorAll('.add__description, .add__value');
      fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach(function(el) {
        el.value = "";
      });

      fieldsArr[0].focus();
    },

    displayBudget: function(obj) {
      var type;
      obj.budget > 0 ? type = 'inc' : type = 'exp';

      DOMstrings.budgetLabel.textContent = formatNumber(obj.budget, type);
      DOMstrings.incomeLabel.textContent = formatNumber(obj.totalIncome, 'inc');
      DOMstrings.expensesLabel.textContent = formatNumber(obj.totalExpenses, 'exp');
      
      if (obj.percentage > 0) {
        DOMstrings.percentageLabel.textContent = obj.percentage + '%';
      } else {
        DOMstrings.percentageLabel.textContent = '--';
      }
    },

    displayPercentages: function(percentages) {
      var fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);

      nodeListForEach(fields, function(el, index) {
        if (percentages[index] > 0) {
          el.textContent = percentages[index] + '%';
        } else {
          el.textContent = '--';
        }
      });
    },

    displayMonth: function() {
      var now, year, month;

      now = new Date();

      year = now.getFullYear();

      months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      month = now.getMonth();

      document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
    },

    changedType: function() {
      var fields = document.querySelectorAll('.add__type, .add__category, .add__description, .add__value');

      nodeListForEach(fields, function(el) {
        el.classList.toggle('red-focus');
      });

      DOMstrings.inputBtn.classList.toggle('red');
    },

    hideCategories: function() {
      if (DOMstrings.inputType.value === 'exp') {
        DOMstrings.inputCategory.style.display = 'inline-block';
      } else {
        DOMstrings.inputCategory.style.display = 'none';
      }
    },

    changeTab: function(e) {
      if (e.target.classList.contains('view__type')) {
        var tabs, contents, clickedTab;

        contents = document.getElementsByClassName('bottom');
        tabs = document.getElementsByClassName('view__type');

        nodeListForEach(contents, function(el) {
          el.style.display = 'none';
        });

        nodeListForEach(tabs, function(el) {
          el.className = el.className.replace('view__type view__type--selected', 'view__type');
        });

        clickedTab = e.target.id;

        document.querySelector('.' + clickedTab).style.display = 'block';
        e.target.className = e.target.className.replace('view__type', 'view__type view__type--selected');
      }
    },

    getSelectedCategory: function() {
        return DOMstrings.selectCategory.value;
    },

    changeSummaryHeader: function (cat) {
      var expTitle;

      expTitle = DOMstrings.expensesTitle;
      expTitle.textContent = formatCategoryString(cat) + ' expenses';
    },

    addFilteredExpensesToUI: function(cat, arr, sum) {
      var element, list, html, newHtml, oneCatExpenses, sumHtml, newSumHtml;

      element = DOMstrings.expensesSummaryContainer;
      element.innerHTML = '';
      list = '';

      html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">%percentage%%</div></div></div>';

      if (arr.length === 0) element.textContent = 'Nothing here yet. Add your expenses!';

      if (arr.length > 0) {
        oneCatExpenses = arr;

        if (cat !== 'all') {
          oneCatExpenses = arr.filter(function(el) {
            return el.category.includes(cat);
          });
        }

        oneCatExpenses.forEach(function(el) {
          if (cat === 'all') {
            html = distinguishCategories(el.category);
          }

          newHtml = html.replace('%id%', el.id);
          newHtml = newHtml.replace('%description%', el.description);
          newHtml = newHtml.replace('%value%', formatNumber(el.value, 'exp'));
          console.log(el);
          if (el.percentage < 1) {
            newHtml = newHtml.replace('%percentage%%', '--');
          } else {
            newHtml = newHtml.replace('%percentage%', el.percentage);
          }
          
          list += newHtml + ' ';
        });

        if (sum.allItemsPercentage < 0 || sum.totalCategoryPercentage < 0) {
          sum.allItemsPercentage, sum.totalCategoryPercentage = '--';
        } 

        // Add html of TOTAL record
        sumHtml = '<div class="item item--summary clearfix" id="total"><div class="item__description">TOTAL</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">--</div></div></div>';

        newSumHtml = sumHtml.replace('%value%', formatNumber(sum.totalExpenses, 'exp'));

        newSumHtml = newSumHtml.replace('>--', '>' + sum.totalCategoryPercentage + '%');
        
        // Add TOTAL html to html list
        list += newSumHtml;
        
        return list;
      }
    },

    displayFilteredExpenses: function(list) {
      var element;

      element = DOMstrings.expensesSummaryContainer;
      element.innerHTML = list;
    },

    getDOMstrings: function() {
      return DOMstrings;
    }
  }

})();



// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {

  var setupEventListeners = function() {
    var DOM = UICtrl.getDOMstrings();

    DOM.inputBtn.addEventListener('click', ctrlAddItem);

    document.addEventListener('keypress', function(e) {
      if (e.keyCode === 13 || e.which === 13) {
        ctrlAddItem();
      }
    });

    DOM.container.addEventListener('click', ctrlDeleteItem);

    DOM.inputType.addEventListener('change', function() {
      UICtrl.changedType();
      UICtrl.hideCategories();
    });

    DOM.viewContainer.addEventListener('click', UICtrl.changeTab);

    DOM.selectCategory.addEventListener('change', displayExpensesByCategories);

    DOM.refreshBtn.addEventListener('click', displayExpensesByCategories);
  };


  var populateCategories = function() {
    var categories;
    // Get DOM strings from UI controller
    var DOM = UICtrl.getDOMstrings();

    // Get categories from data structure from budget controller
    categories = budgetCtrl.getCategories();

    // Display categories in Input and Summary tabs
    UICtrl.displayCategories(categories, DOM.inputCategory);
    UICtrl.displayCategories(categories, DOM.selectCategory);
  }


  var updateBudget = function() {
    // 1. Calculate the budget
    budgetCtrl.calculateBudget();

    // 2. Return the budget
    var budget = budgetCtrl.getBudget();

    // 3. Display the budget in the UI
    UICtrl.displayBudget(budget);
  }


  var updatePercentages = function() {
    // 1. Calculate percentages
    budgetCtrl.calculatePercentages();

    // 2. Read percentages from the budget controller
    var percentages = budgetCtrl.getPercentages();

    // 3. Update the UI with the new percentages
    UICtrl.displayPercentages(percentages);
  }

  var calculateCategoryTotals = function(cat) {
    budgetCtrl.getCategoryTotals(cat);
  }


  var ctrlAddItem = function() {
    var input, newItem;

    // 1. Get the input from UI
    input = UICtrl.getInput();

    if (input.description && input.value) {
      // 2. Add the item to the budget controller
      newItem = budgetCtrl.addItem(input.type, input.category, input.description, input.value);
      budgetCtrl.testing();

      // 3. Add the item to the input tab UI
      UICtrl.addListItem(newItem, input.type, input.category);

      // 4. Clear the fields
      UICtrl.clearFields();

      // 5. Calculate and update budget
      updateBudget();

      // 6. Calculate and update percentages
      updatePercentages();

      // 7. Calculate category totals
      calculateCategoryTotals(input.category);
    }
  }


  var ctrlDeleteItem = function(e) {
    if (e.target.classList.contains('ion-ios-close-outline')) {
      var itemId, splitId, type, id;

      itemId = e.target.parentNode.parentNode.parentNode.parentNode.id;

      if (itemId) {
        splitId = itemId.split('-');
        type = splitId[0];
        id = parseInt(splitId[1]);

        console.log(itemId);

        // 1. Delete the item from the data structure
        budgetCtrl.deleteItem(type, id);

        // 2. Delete the item from the UI
        UICtrl.deleteListItem(itemId);

        // 3. Update and show the new budget
        updateBudget();

        // 4. Calculate and update percentages
        updatePercentages();

        // 5. Calculate category totals
        calculateCategoryTotals(input.category);
      }
    }
  }


  var displayExpensesByCategories = function() {
    var selectedCat, filteredExpenses, addedExpenses, categoryTotals;
    
    // 1. Get selected category from UI controller
    selectedCat = UICtrl.getSelectedCategory();

    // 2. Change header in Summary view in UI controller
    UICtrl.changeSummaryHeader(selectedCat);
    
    // 3. Get filtered expenses from Budget Controller
    filteredExpenses = budgetCtrl.getFilteredExpenses(selectedCat);

    // 4. Get total expenses and percentage for specific category
    categoryTotals = budgetCtrl.getCategoryTotals(selectedCat);
    console.log(categoryTotals);
    
    // 5. Add expenses to UI (they're not displayed yet)
    addedExpenses = UICtrl.addFilteredExpensesToUI(selectedCat, filteredExpenses, categoryTotals);

    // 6. Display filtered expenses in UI
    if (addedExpenses) {
      UICtrl.displayFilteredExpenses(addedExpenses);
    }
  }


  return {
    init: function() {
      console.log('App has started');
      populateCategories();
      UICtrl.displayMonth();
      UICtrl.displayBudget(
        {
          budget: 0,
          totalIncome: 0,
          totalExpenses: 0,
          percentage: -1
        }
      );
      setupEventListeners();
    }
  }

})(budgetController, UIController);

controller.init();