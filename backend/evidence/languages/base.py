from abc import ABC, abstractmethod
from typing import List, Optional

from evidence.models import Evidence

class LanguageParser(ABC):
    language = "unknown"

    @abstractmethod
    def supported_extensions(self) -> List[str]:
        raise NotImplementedError

    @abstractmethod
    def extract(
        self,
        file_path: str,
        repo_id: str,
        commit: Optional[str] = None,
    ) -> List[Evidence]:
        raise NotImplementedError