function getRandomValue(min, max) {
  const randomNum = Math.random();
  const scaledNum = randomNum * (max - min + 1) + min;
  const roundedNum = Math.floor(scaledNum);

  return roundedNum;
}

exports.getRandomValue = getRandomValue;