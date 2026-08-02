"""
===========================================================
ReliefMap
News Routes
Author : Vigneshan S
Year : 2026
===========================================================
"""

from flask import Blueprint, jsonify, request

from database import db
from models.news import News

news_bp = Blueprint(
    "news",
    __name__,
    url_prefix="/aoi"
)

# ===========================================================
# GET ALL NEWS
# GET /aoi/news
# ===========================================================

@news_bp.route("/news", methods=["GET"])
def get_news():

    news = News.query.filter_by(
        is_active=True
    ).order_by(
        News.published_at.desc()
    ).all()

    return jsonify({

        "success": True,

        "count": len(news),

        "data": [

            item.to_dict()

            for item in news

        ]

    }), 200


# ===========================================================
# GET SINGLE NEWS
# GET /aoi/news/<id>
# ===========================================================

@news_bp.route("/news/<int:news_id>", methods=["GET"])
def get_news_by_id(news_id):

    news = News.query.get(news_id)

    if not news:

        return jsonify({

            "success": False,

            "message": "News not found."

        }), 404

    news.views += 1

    db.session.commit()

    return jsonify({

        "success": True,

        "data": news.to_dict()

    }), 200


# ===========================================================
# CREATE NEWS
# POST /aoi/news
# ===========================================================

@news_bp.route("/news", methods=["POST"])
def create_news():

    body = request.get_json()

    news = News(

        title=body.get("title"),

        content=body.get("content"),

        image=body.get("image"),

        category=body.get("category", "General"),

        priority=body.get("priority", "Medium"),

        author=body.get("author", "Administrator"),

        location=body.get("location")

    )

    db.session.add(news)

    db.session.commit()

    return jsonify({

        "success": True,

        "message": "News created successfully.",

        "data": news.to_dict()

    }), 201


# ===========================================================
# UPDATE NEWS
# PUT /aoi/news/<id>
# ===========================================================

@news_bp.route("/news/<int:news_id>", methods=["PUT"])
def update_news(news_id):

    news = News.query.get(news_id)

    if not news:

        return jsonify({

            "success": False,

            "message": "News not found."

        }), 404

    body = request.get_json()

    news.title = body.get(

        "title",

        news.title

    )

    news.content = body.get(

        "content",

        news.content

    )

    news.image = body.get(

        "image",

        news.image

    )

    news.category = body.get(

        "category",

        news.category

    )

    news.priority = body.get(

        "priority",

        news.priority

    )

    news.author = body.get(

        "author",

        news.author

    )

    news.location = body.get(

        "location",

        news.location

    )

    news.is_active = body.get(

        "is_active",

        news.is_active

    )

    db.session.commit()

    return jsonify({

        "success": True,

        "message": "News updated successfully.",

        "data": news.to_dict()

    }), 200


# ===========================================================
# DELETE NEWS
# DELETE /aoi/news/<id>
# ===========================================================

@news_bp.route("/news/<int:news_id>", methods=["DELETE"])
def delete_news(news_id):

    news = News.query.get(news_id)

    if not news:

        return jsonify({

            "success": False,

            "message": "News not found."

        }), 404

    db.session.delete(news)

    db.session.commit()

    return jsonify({

        "success": True,

        "message": "News deleted successfully."

    }), 200


# ===========================================================
# FEATURED NEWS
# GET /aoi/news/featured
# ===========================================================

@news_bp.route("/news/featured", methods=["GET"])
def featured_news():

    news = News.query.filter_by(

        is_active=True

    ).order_by(

        News.priority.desc(),

        News.published_at.desc()

    ).first()

    if not news:

        return jsonify({

            "success": False,

            "message": "No featured news available."

        }), 404

    return jsonify({

        "success": True,

        "data": news.to_dict()

    }), 200


# ===========================================================
# EMERGENCY NEWS
# GET /aoi/news/emergency
# ===========================================================

@news_bp.route("/news/emergency", methods=["GET"])
def emergency_news():

    emergency = News.query.filter(

        News.priority.in_(

            ["High", "Critical"]

        )

    ).filter_by(

        is_active=True

    ).order_by(

        News.published_at.desc()

    ).all()

    return jsonify({

        "success": True,

        "count": len(emergency),

        "data": [

            item.to_dict()

            for item in emergency

        ]

    }), 200