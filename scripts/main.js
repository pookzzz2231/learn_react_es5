//import react library with common.js
var React = require('react');
var ReactDOM = require('react-dom');

var h = require('./helpers');

var ReactRouter = require('react-router'),
    Router = ReactRouter.Router,
    Route = ReactRouter.Route,
    History = ReactRouter.History;

var sampleData = require('./sample-fishes');
    
var createBrowserHistory = require('history/lib/createBrowserHistory');

var App = React.createClass({
  getInitialState: function() {
    return {
      fishes: {},
      order: {}
    }
  },
  componentDidMount: function() {
    //load sample when component first initial mount
    this.loadSample();

    var storage = localStorage.getItem('order-' + this.props.params.storeId);

    //check if exists
    if (storage) {
      this.setState({ order: JSON.parse(storage) })
    }
  },
  componentWillUpdate: function(nextProp, nextState) {
    localStorage.setItem('order-' + this.props.params.storeId, JSON.stringify(nextState.order));
  },
  addToOrder: function(fish) {
    this.state.order[fish] = this.state.order[fish] + 1 || 1;
    this.setState({ order: this.state.order });
  },
  addFish: function(fish) {
    var timestamp = (new Date()).getTime();
    
    //update state; fishes obj
    this.state.fishes['fish' + timestamp] = fish;

    //set state
    this.setState({ fishes: this.state.fishes });
  },
  loadSample: function() {
    this.setState( {fishes: sampleData} );
  },
  renderFish: function(key, i) {
    return (
      <Fish key={i + 1} index={key} data={this.state.fishes[key]} addToOrder={this.addToOrder} />
    )
  },
  updateInventory: function(key, param, newValue) {
    this.state.fishes[key][param] = newValue
    this.setState({ fishes: this.state.fishes });
  },
  render: function() {
    return (
      <div className="catch-of-the-day">
        <div className="menu">
          <Header tagline="SeaFood Market" />
          <ul className="list-of-fishes">
            {Object.keys(this.state.fishes).map(this.renderFish)}
          </ul>
        </div>
        <Order fishes={this.state.fishes} order={this.state.order} />
        <Inventory updateInventory={this.updateInventory} fishes={this.state.fishes} loadSample={this.loadSample} addToOrder={this.addToOrder} />
      </div>
    )
  },
});

var Order = React.createClass({
  orderIds: function() { return Object.keys(this.props.order) },
  findFish: function(key) { return this.props.fishes[key] },
  findQuantity: function(key) { return this.props.order[key] },
  total: function() {
    var total = 0;

    this.orderIds().forEach(function(order_key) {
      var fish = this.findFish(order_key), //get fish with order key
          order_count = this.findQuantity(order_key); //get order value count

      //if fish is available      
      if (fish && (fish.available)) {
        total += (parseInt(order_count, 10) * parseInt(fish.price, 10));
      }
    }.bind(this));

    return total;
  },
  renderOrder: function(order_key, i) {
    var count = this.findQuantity(order_key),
        name = this.findFish(order_key).name,
        price = this.findFish(order_key).price;

    return (
      <li key={i}>
        <span>{count}</span>
        <span>Ibs</span>
        <span>{name}</span>
        <span className="price">{h.formatPrice(price)}</span>
      </li>
    )
  },
  render: function() {
    var total = this.total();

    return (
      <div className="order-wrap">
        <h2 className="order-title">Your Order</h2>
        <ul className="order">
          {this.orderIds().map(this.renderOrder)}
          <li className="total">
            <strong>Total: </strong>
            <span>{h.formatPrice(total)}</span>
          </li>
        </ul>
      </div>
    )
  },
});

var Fish = React.createClass({
  clickButton: function(e) {
    e.preventDefault();

    var fish = this.props.index;
    this.props.addToOrder(fish);
  },
  render: function() {
    var fish = this.props.data;
    var isAvailable = h.stringBoolean(fish.available);
    var buttonText = (isAvailable ? "Add to Order" : "Sold Out!")
    return (
      <li className="menu-fish">
        <img src={fish.image} alt={fish.name} />
        <h3 className="fish-name">
          {fish.name}
          <span className="price">{h.formatPrice(fish.price)}</span>
        </h3>
        <p>{fish.desc}</p>
        <button disabled={!isAvailable} onClick={this.clickButton}>{buttonText}</button>
      </li>
    )
  },
});

var Inventory = React.createClass({
  handleInput: function(param, e) {
    var value = e.target.value,
        key = e.target.getAttribute('name');

    this.props.updateInventory(key, param, value);
  },
  renderInventory: function(key) {
    var fish = this.props.fishes[key];
    return (
      <div className="fish-edit" key={key}>
        <input type="text" name={key} value={fish.name} onChange={this.handleInput.bind(this, 'name')}/>
        <input type="text" name={key} value={fish.price} onChange={this.handleInput.bind(this, 'price')}/>
        <select name={key} value={fish.available} onChange={this.handleInput.bind(this, 'available')}>
          <option value={false}>Sold Out!</option>
          <option value={true}>Fresh!</option>
        </select>
      </div>
    )
  },
  render: function() {
    return (
      <div>
        <h2>Inventory</h2>
        {Object.keys(this.props.fishes).map(this.renderInventory)}
        <AddFishForm addFish={this.props.addFish} />
        <button onClick={this.props.loadSample}>Load Sample Data</button>
      </div>
    )
  },
});

var AddFishForm = React.createClass({
  createFish: function(e) {
    e.preventDefault();

    //build object
    var fish = {
      name: this.refs.name.value,
      price: this.refs.price.value,
      status: this.refs.status.value,
      desc: this.refs.desc.value,
      image: this.refs.image.value,
    }

    //call addFish() method from App as props  
    this.props.addFish(fish);
    this.refs.fishForm.reset(); //reset form
  },
  render: function() {
    return (
      <form className="fish-edit" ref="fishForm" onSubmit={this.createFish}>
        <input type="text" ref="name" placeholder="Fish Name"/>
        <input type="text" ref="price" placeholder="Fish Price"/>
        <select ref="status">
          <option value="available">Fresh!</option>
          <option value="unavailable">Sold Out!</option>
        </select>
        <textarea type="text" ref="desc" placeholder="Desc"></textarea>
        <input type="text" ref="image" placeholder="image url"/>
        <button type="submit">+ Add Item</button>
      </form>
    )
  }
});

var Header = React.createClass({
  render: function() {
    return (
      <header className="top">
        <h1>Catch
          <span className="ofThe">
            <span className="of">of</span>
            <span className="the">the</span>
          </span>
          Day
        </h1>
        <h3 className="tagline">
          <span>{this.props.tagline}</span>
        </h3>
      </header>
    )
  },
});

var StorePicker = React.createClass({
  mixins: [History],
  goToStore: function(e) {
    e.preventDefault();
    //get value from input  
    var storeID = this.refs.storeId.value;

    //navagate url to storeID
    this.history.pushState(null, "/store/" + storeID);
  },
  render: function() {
    return (
      <form className="store-selector" onSubmit={this.goToStore}>
        <h2>Select Store</h2>
        <input type="text" ref="storeId" defaultValue={h.getFunName()} required />
        <input type="submit" />        
      </form>
    )
  },
});

var NotFound = React.createClass({
  render: function() {
    return (
      <h1>Not Found</h1>
    )
  },
});

//routes
var routes = (
  <Router history={createBrowserHistory()}>
    <Route path="/" component={StorePicker} />
    <Route path="/store/:storeId" component={App} />
    <Route path="*" component={NotFound} />
  </Router>
)

ReactDOM.render(routes, document.querySelector('#main'));