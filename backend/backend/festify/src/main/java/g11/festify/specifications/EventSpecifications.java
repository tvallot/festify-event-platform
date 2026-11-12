package g11.festify.specifications;

import g11.festify.models.Event;
import org.springframework.data.jpa.domain.Specification;

public class EventSpecifications {

    public static Specification<Event> hasCategory(String category) {
        return (root, query, cb) -> category == null ? null : cb.equal(root.get("category"), category);
    }

    public static Specification<Event> hasKeyword(String keyword) {
        return (root, query, cb) -> keyword == null ? null :
                cb.like(cb.lower(root.get("title")), "%" + keyword.toLowerCase() + "%");
    }

    public static Specification<Event> isFree(Boolean isFree) {
        return (root, query, cb) -> isFree == null ? null : cb.equal(root.get("isFree"), isFree);
    }

    public static Specification<Event> inLocation(String location) {
        return (root, query, cb) -> location == null ? null :
                cb.like(cb.lower(root.get("location")), "%" + location.toLowerCase() + "%");
    }
}