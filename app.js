//BUDGET CONTROLLER
var budgetController = (function() {
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function(type) {
    var sum = 0;
    data.allItems[type].forEach(function(arr) {
      sum = sum + arr.value;
    });
    data.totals[type] = sum;
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
    percentage: -1
  };

  return {
    addItem: function(type, des, val) {
      var newItem, ID;

      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      if (type === "exp") {
        newItem = new Expense(ID, des, val);
      } else {
        newItem = new Income(ID, des, val);
      }

      data.allItems[type].push(newItem);
      return newItem;
    },

    deleteItem: function(type, id) {
      var filteredArray = {};
      filteredArray[type] = data.allItems[type].filter(obj => obj.id !== id);
      data.allItems[type] = filteredArray[type];
    },

    calculateBudget: function() {
      //Calculate Total income and expenses
      calculateTotal("inc");
      calculateTotal("exp");

      // Calculate the Budget icome - expense
      data.budget = data.totals.inc - data.totals.exp;

      // Calculate the percentage of income that we spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      };
    },

    testing: function() {
      console.log(data);
    }
  };
})();

//UI CONTROLLER
var UIController = (function() {
  var DOMStrings = {
    inputTypeClass: ".add__type",
    inputDescriptionClass: ".add__description",
    inputValueClass: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expenseContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expensesLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container"
  };
  //Some Code
  return {
    getInput: function() {
      return {
        type: document.querySelector(DOMStrings.inputTypeClass).value, //Will be either inc or exp
        description: document.querySelector(DOMStrings.inputDescriptionClass)
          .value,
        value: Number(document.querySelector(DOMStrings.inputValueClass).value)
      };
    },

    addListItems: function(obj, type) {
      var html, newHtml, element;

      // Create HTML string with placeholder text
      if (type === "inc") {
        element = DOMStrings.incomeContainer;
        html =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else {
        element = DOMStrings.expenseContainer;
        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      // Replace the placeholder text with actual data
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", obj.value);

      //Insert the HTML into DOM
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },

    deleteListItems: function(id) {
      var element = document.getElementById(id);
      element.parentNode.removeChild(element);
    },

    clearFields: function() {
      document.querySelector(DOMStrings.inputDescriptionClass).value = "";
      document.querySelector(DOMStrings.inputValueClass).value = "";
      document.querySelector(DOMStrings.inputDescriptionClass).focus();
    },

    displayBudget: function(obj) {
      document.querySelector(DOMStrings.budgetLabel).textContent = obj.budget;
      document.querySelector(DOMStrings.incomeLabel).textContent = obj.totalInc;
      document.querySelector(DOMStrings.expensesLabel).textContent =
        obj.totalExp;

      if (obj.percentage > 0) {
        document.querySelector(DOMStrings.percentageLabel).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(DOMStrings.percentageLabel).textContent = "----";
      }
    },

    getDOMStrings: function() {
      return DOMStrings;
    }
  };
})();

//GLOBAL APP CONTROLLER
var controller = (function(budgetControl, UIControl) {
  var setupEventListeners = function() {
    var DOMStrings = UIControl.getDOMStrings();

    document
      .querySelector(DOMStrings.inputBtn)
      .addEventListener("click", ctrlAddItem);

    document.addEventListener("keypress", function(event) {
      if (event.key === "Enter") {
        ctrlAddItem();
      }
    });

    document
      .querySelector(DOMStrings.container)
      .addEventListener("click", ctrlDeleteItem);
  };

  var ctrlAddItem = function() {
    var input, newItem;

    //1. Get the field input data
    input = UIControl.getInput();

    if (input.description !== "" && input.value > 0) {
      //2. Add the item to Budget Controller
      newItem = budgetControl.addItem(
        input.type,
        input.description,
        input.value
      );

      //3. Add the item to the UI
      UIControl.addListItems(newItem, input.type);

      // 4. Clear Input Fields
      UIControl.clearFields();
    }

    // 5. Calculate and Update Budget
    updateBudget();
  };

  var ctrlDeleteItem = function(event) {
    var itemID, element;

    element = event.target.parentNode.parentNode.parentNode.parentNode;
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    console.log(element);
    if (itemID) {
      //inc-1
      var [type, id] = itemID.split("-");

      // 1. Delete the item from the data structure

      budgetControl.deleteItem(type, Number(id));

      // 2. Delete the item from the UI

      UIControl.deleteListItems(Number(id));

      // 3. Update and show the new budget
    }
  };

  var updateBudget = function() {
    //1. Calculate the Budget
    budgetControl.calculateBudget();

    //2. Return Budget
    var budget = budgetControl.getBudget();

    //3. Display the budget on the UI
    UIControl.displayBudget(budget);
  };

  return {
    init: function() {
      console.log("Application Started.");
      UIControl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: 0
      });
      setupEventListeners();
    }
  };
})(budgetController, UIController);

controller.init();
