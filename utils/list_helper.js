const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    return blogs.reduce((sum, current) => sum + current.likes, 0)
}

const favoriteBlog = (blogs) => {
    let maxValue = blogs.reduce((acc, value) => {
        return (acc = acc > value.likes ? acc : value.likes);
    }, 0);

    return blogs.find(blog => blog.likes === maxValue)
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog
}