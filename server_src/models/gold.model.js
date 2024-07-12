const golds = []; //모든 유저의 골드
//gold = {userId: 유저아이디, gold: 현재 골드}

export const addUserGold = (userId) => {
  golds.push({ userId, gold: 0 });
  console.log(golds);
};

//유저 정보와 현재 골드를 저장한다
export const setGold = (userId, gold) => {
  // 기존 유저를 찾기
  const userIndex = golds.findIndex((user) => user.userId === userId);
  golds[userIndex].gold = gold;
};

//해당하는 유저의 골드를 반환한다
export const getGold = (userId) => {
  const userIndex = golds.findIndex((user) => user.userId === userId);

  if (userIndex === -1) {
    return;
  }

  return golds[userIndex].gold;
};

export const initGold = (userId) => {
  const userIndex = golds.findIndex((user) => user.userId === userId);

  if (userIndex === -1) {
    return;
  }

  golds.splice(userIndex, 1);
};
