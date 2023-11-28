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

const mostBlogs = (blogs) => {
    const foundedAuthors = blogs.map(blog => blog.author)

    const filteredAuthors = []
    foundedAuthors.forEach(author => {
        if (!filteredAuthors.includes(author)) filteredAuthors.push(author)
    });

    result = []
    filteredAuthors.forEach(author => {
        let i = 0;
        foundedAuthors.forEach(foundedAuthor => {
            if (foundedAuthor === author) i++
        })

        const obj = {}
        obj.author = author
        obj.blogs = i

        result.push(obj)
    })


    let maxValue = result.reduce((acc, value) => {
        return (acc = acc > value.blogs ? acc : value.blogs);
    }, 0);

    return result.find(author => author.blogs === maxValue)
}

const mostLikes = (blogs) => {
    const foundedAuthors = blogs.map(blog => blog.author)

    const filteredAuthors = []
    foundedAuthors.forEach(author => {
        if (!filteredAuthors.includes(author)) filteredAuthors.push(author)
    });

    result = []
    filteredAuthors.forEach(filteredAuthor => {
        let i = 0;
        blogs.forEach(blogAuthor => {
            if (filteredAuthor === blogAuthor.author) i = i + blogAuthor.likes
        })

        const obj = {}
        obj.author = filteredAuthor
        obj.likes = i

        result.push(obj)
    })

    let maxValue = result.reduce((acc, value) => {
        return (acc = acc > value.likes ? acc : value.likes);
    }, 0);

    return result.find(author => author.likes === maxValue)
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}