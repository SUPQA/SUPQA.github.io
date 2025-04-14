import * as React from 'react';
import type { IControl } from 'react-map-gl';
import { useControl } from 'react-map-gl';
class SquareControlClass implements IControl {
  _map;
  _container;
  _onClick;
  btn;
  _span;
  _className;

  constructor(props) {
    this._onClick = props.onClick;
    this._className = props.className;
  }
  onAdd(map) {
    this._map = map;
    // this._container = document.createElement('div');
    // this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
    this._container = document.querySelector('.mapboxgl-ctrl-group');

    this.btn = document.createElement('button');
    this.btn.className = 'mapboxgl-ctrl-square';
    this.btn.type = 'button';
    this.btn.onclick = this._onClick;

    this._span = document.createElement('span');
    this._span.className = this._className;

    this.btn.appendChild(this._span);
    this._container.appendChild(this.btn);
    return this._container;
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }
}

export function SquareControl(props) {
  useControl(() => new SquareControlClass(props), {
    position: props.position,
  });

  return null;
}
