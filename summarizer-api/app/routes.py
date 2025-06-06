from fastapi import APIRouter, BackgroundTasks
from fastapi.responses import JSONResponse
from app.utils import fetch_and_process_feeds, rewrite_title_for_seo, generate_slug
from app.cache import article_cache

router = APIRouter()

# POST endpoint for individual summarization
@app.post("/summarize")
def summarize_news(news: NewsItem):
    summary = summarize_long_text(news.description)
    seo_title = rewrite_title_for_seo(news.title)
    return {
        "original_title": news.title,
        "seo_title": seo_title,
        "summary": summary
    }

# GET endpoint to fetch full news list
@router.get("/api/news")
async def get_news():
    all_articles = fetch_and_process_feeds()
    if not all_articles:
        return JSONResponse(status_code=404, content={"message": "No news found"})

    formatted_posts = []
    for article in all_articles:
        formatted_posts.append({
            "title": article["title"],
            "seo_title": rewrite_title_for_seo(article["title"]),
            "slug": generate_slug(article["title"]),
            "featured_image": article["image"],
            "published_date": article["pubDate"],
            "content": f"<p>{article['description'].replace('. ', '.</p><p>')}</p>",
            "read_more_link": article["link"]
        })

    return JSONResponse(content={"posts": formatted_posts})

# Optional: background trigger endpoint
@router.get("/trigger-fetch")
async def trigger_fetch(background_tasks: BackgroundTasks):
    background_tasks.add_task(fetch_and_process_feeds)
    return {"message": "Feed processing started in background"}
