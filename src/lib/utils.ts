// 获取叶子结点
export function getLeafNodes(arr) {
  let leafNodes = [];
  for (let item of arr) {
    if (!item.children || item.children.length === 0) {
      leafNodes.push(item);
    } else {
      leafNodes = leafNodes.concat(getLeafNodes(item.children));
    }
  }
  return leafNodes;
}

export function getAllNodes(arr) {
  let leafNodes = [];
  for (let item of arr) {
    leafNodes.push(item);
    if (item.children && item.children.length > 0) {
      leafNodes = leafNodes.concat(getAllNodes(item.children));
    }
  }
  return leafNodes;
}

export function getDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c * 1000;
}

export function tickFormatter(value) {
  const label = value.split('_')[0];

  if (label.length > 18) {
    return label
      .split(' ')
      .map((item) => item.substring(0, 2))
      .join('.');

    // return label.substring(0, 2) + '...';
  }
  return label;
}

export function hexToRgb(hex) {
  // 移除十六进制颜色值前面的 #
  hex = hex.replace('#', '');

  // 解析每一对十六进制数字为十进制
  var r = parseInt(hex.substr(0, 2), 16);
  var g = parseInt(hex.substr(2, 2), 16);
  var b = parseInt(hex.substr(4, 2), 16);

  // 返回 RGB 数组
  return [r, g, b];
}

export function latlng2pixel(lng, lat) {
  var maxLat = 31.89;
  var minLat = 30.658;
  var maxLng = 122.174;
  var minLng = 120.8;
  var imgSize = [4000, 4200]; // Assuming img_size is an array with two elements: [height, width]

  var x = Math.floor(((lng - minLng) / (maxLng - minLng)) * imgSize[1]);
  var y = Math.floor(
    imgSize[0] - ((lat - minLat) / (maxLat - minLat)) * imgSize[0]
  );

  return [x, y];
}
