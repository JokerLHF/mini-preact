import { h, render, Component } from '../src'

class Child extends Component {
  static getDerivedStateFromProps () {
    console.log('getDerivedStateFromProps-children');
  }
  componentDidMount () {
    console.log('componentDidMount-children');
  }
  shouldComponentUpdate () {
    console.log('shouldComponentUpdate-children');
    return true;
  }
  componentDidUpdate () {
    console.log('componentDidUpdate-children');
  }
  getSnapshotBeforeUpdate () {
    console.log('getSnapshotBeforeUpdate-children');
  }
  componentWillUnmount () {
    console.log('componentWillUnmount-children');
  }
  render () {
    return (
      <div>children</div>
    )
  }
}

class Father extends Component {
  state = {
    a: 0
  }
  static getDerivedStateFromProps () {
    console.log('getDerivedStateFromProps-fahter');
  }
  componentDidMount () {
    console.log('componentDidMount-father');
  }
  shouldComponentUpdate () {
    console.log('shouldComponentUpdate-father');
    return true;
  }
  componentDidUpdate () {
    console.log('componentDidUpdate-father');
  }
  getSnapshotBeforeUpdate () {
    console.log('getSnapshotBeforeUpdate-father');
  }

  componentWillUnmount () {
    console.log('componentWillUnmount-father');
  }
  handleAddStateA = () => {
    this.setState({ a: this.state.a + 1 });
  }
  render () {
    return (
      <div>
        <div onClick={this.handleAddStateA} style={{ 'height': 43, 'border': '1px red solid' }}>+</div>
        <span>{this.state.a}</span>
        {!this.state.a && <Child />}
      </div>
    )
  }
}


function Test () {
  return (
    <div>111</div>
  )
}
render(
  <Father />,
  document.getElementById('app'),
)
