//simple matching algorithm
const calculateSimilarity = (userA, userB) => {
    let score = 0;

    //step 1: check interest overlap
    const userAInterests = userA.interests || [];
    const userBInterests = userB.interests || [];

    const commonInterests = userAInterests.filter(interest => userBInterests.includes(interest));

    //similarity based on shared (0-100)
    if (userAInterests.length > 0) {
       score += (commonInterests.length / userAInterests.length) * 60; 
    }

    if (commonInterests.length >= 3) {
        score += 20; //20%bonus
    }

    //bio length similarity
    const bioA = (userA.about || "").length;
    const bioB = (userB.about || "").length;

    if (bioA > 20 && bioB > 20) {
        score += 20; //both have good bios
    }
    return score
};

//Get matching profiles for a user
const getMatchesForUser = (currentUser, allUsers) => {
    return allUsers
        .filter(user => user.userId != currentUser.userId) //don't match with self
        .map(user => ({
            ...user,
            similarityScore: calculateSimilarity(currentUser, user)
        }))
        .filter(user => user.similarityScore > 0) //only profiles with some similarity
        .sort((a,b) => b.similarityScore - a.similarityScore) //sort by similarity(highest first)
        .slice(0, 50);
}

module.exports = { calculateSimilarity, getMatchesForUser}