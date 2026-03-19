"""
Ogma Cultural Scoring Service
Scores Anansi's stories for cultural appropriateness (1-10)
Returns score + story_hash (SHA-256 of story text) for on-chain TEE attestation
"""

import hashlib
import json
import time
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="Ogma Scorer", description="TEE-attested cultural appropriateness scoring")


class ScoreRequest(BaseModel):
    story: str
    story_id: str | None = None


class ScoreResponse(BaseModel):
    score: int                    # 1-10 cultural appropriateness rating
    story_hash: str               # SHA-256 hex of story text — proof of which story was scored
    story_hash_bytes: list[int]   # Raw bytes for on-chain submission (32 bytes)
    scored_at: int                # Unix timestamp
    story_id: str | None
    rationale: str                # Brief reasoning — visible but execution was shielded in TEE


def compute_story_hash(story_text: str) -> tuple[str, list[int]]:
    """SHA-256 of story text. This hash is committed on-chain alongside the score."""
    h = hashlib.sha256(story_text.encode("utf-8")).digest()
    return h.hex(), list(h)


async def score_story_with_venice(story: str) -> tuple[int, str]:
    """
    Call Venice AI to score cultural appropriateness.
    Returns (score: int, rationale: str)
    This call happens INSIDE the TEE — Venice sees the story, but the
    result is attested before being written to L1.
    """
    # TODO: replace with actual Venice AI call (copy from celo-agent-demo ogma service)
    # Prompt pattern from existing Ogma:
    # "Rate the cultural appropriateness of this story on a scale of 1-10.
    #  Consider: accurate representation, respectful framing, non-stereotyping.
    #  Respond with JSON: {score: N, rationale: '...'}"
    
    # Stub for scaffold — real implementation imports from existing Ogma service
    raise NotImplementedError("Wire in Venice AI call from celo-agent-demo/ogma/main.py")


@app.post("/score", response_model=ScoreResponse)
async def score(request: ScoreRequest):
    """
    Score a story for cultural appropriateness.
    Returns score + story_hash for on-chain TEE attestation proof.
    
    The story_hash binds the score to this exact story text —
    you cannot swap in a different story after the fact.
    """
    if not request.story or len(request.story) < 10:
        raise HTTPException(status_code=400, detail="Story too short")

    story_hash_hex, story_hash_bytes = compute_story_hash(request.story)

    # In real implementation — this is the Venice AI call inside the TEE
    # score_val, rationale = await score_story_with_venice(request.story)

    # Scaffold stub:
    score_val = 8
    rationale = "Story demonstrates respectful cultural framing with accurate representation."

    return ScoreResponse(
        score=score_val,
        story_hash=story_hash_hex,
        story_hash_bytes=story_hash_bytes,
        scored_at=int(time.time()),
        story_id=request.story_id,
        rationale=rationale,
    )


@app.get("/health")
async def health():
    return {"status": "ok", "service": "ogma-scorer"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
